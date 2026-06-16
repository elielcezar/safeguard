import dotenv from 'dotenv';
import axios from 'axios';
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'; // Para gerar código aleatório de 2FA
import nodemailer from 'nodemailer';

// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar se JWT_SECRET foi carregado
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não encontrado no ambiente.');
  process.exit(1);
}

// Função para verificar o token do reCAPTCHA
async function verifyRecaptcha(token) {
  try {    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('Ambiente de desenvolvimento: reCAPTCHA simulado');
      return true;
    }   
    
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );    
    
    return response.data.success;
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error);
    return false;
  }
}

async function sendTwoFactorCodeEmail(to, code) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[Email] SMTP_USER ou SMTP_PASS não configurados');
      return false;
    }

    const info = await mailTransporter.sendMail({
      from: process.env.MAIL_FROM || `SafeGuard <${process.env.SMTP_USER}>`,
      to,
      subject: 'SafeGuard — Código de verificação',
      text: `Seu código de verificação é: ${code}\n\nVálido por 10 minutos. Não compartilhe este código.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px">
        <h2>SafeGuard</h2>
        <p>Seu código de verificação é:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
        <p>Válido por 10 minutos. Não compartilhe este código.</p>
      </div>`,
    });

    console.log(`[Email] Código enviado. messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar: ${error.message}`);
    return false;
  }
}

router.post("/login", async (req, res) => {
  const {email, password, recaptchaToken} = req.body;  
  
  if (!recaptchaToken) {
    return res.status(400).json({
      message: 'Verificação de reCAPTCHA necessária'
    });
  }

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  
  if (!isRecaptchaValid) {
    return res.status(400).json({
      message: 'Verificação de reCAPTCHA falhou. Por favor, tente novamente.'
    });
  }

  try{
    const user = await prisma.user.findUnique({
      where: {email}
    }); 
    
    if(!user){
      return res.status(401).json({
        message: 'Usuario nao encontrado. Por favor verifique suas credenciais.'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);    

    if(!validPassword){
      return res.status(401).json({
        message: 'Senha não confere. Por favor verifique suas credenciais.'
      });
    }

    // Gerar código 2FA
    const twoFactorCode = crypto.randomInt(100000, 999999).toString();

    console.log(`[2FA] Código gerado para ${email}: ${twoFactorCode}`);
    
    // Token temporário com o código 2FA
    const tempToken = jwt.sign({
      userId: user.id,
      email: user.email,
      twoFactorCode: twoFactorCode,
      step: '2fa-pending'
    }, JWT_SECRET, {expiresIn: '10m'});    
    
    console.log(`[2FA] Enviando código via email para: ${user.email}`);

    const messageSent = await sendTwoFactorCodeEmail(user.email, twoFactorCode);

    if (!messageSent) {
      console.error(`[2FA] Falha no envio do código por email`);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Bypass 2FA para ${user.email} - falha no envio`);

        const token = jwt.sign({
          userId: user.id,
          email: user.email
        }, JWT_SECRET, {expiresIn: '1h'});

        return res.status(200).json({
          message: 'Login realizado com sucesso (2FA ignorado em ambiente de desenvolvimento)',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      return res.status(500).json({
        message: 'Erro ao enviar código de verificação por email. Tente novamente.',
        details: 'Falha na comunicação com o serviço de email'
      });
    }

    console.log(`[2FA] Código enviado com sucesso por email`);

    res.status(200).json({
      message: 'Primeira etapa concluída. Verifique o código enviado por email.',
      tempToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      requireTwoFactor: true
    });

  } catch (error) {    
    console.error(`[Login] Erro: ${error.message}`);
    res.status(500).json({
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
});

export default router;
