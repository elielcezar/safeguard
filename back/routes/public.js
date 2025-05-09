import dotenv from 'dotenv';
import axios from 'axios';
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'; // Para gerar código aleatório de 2FA
import twilio from 'twilio'; // Para enviar mensagens via WhatsApp

// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Verificar se JWT_SECRET foi carregado
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não encontrado no ambiente.');
  process.exit(1);
}

// Função para verificar o token do reCAPTCHA
async function verifyRecaptcha(token) {
  try {    
    // Determina se está em desenvolvimento
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Em desenvolvimento, sempre retorna true para facilitar os testes
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

// Função para enviar código 2FA
async function sendTwoFactorCodeWhatsApp(phoneNumber, code) {
  try {
    // Verificar ambiente de desenvolvimento
    const isDevelopment = process.env.NODE_ENV === 'development';    
    // Formatar número de telefone para garantir formato internacional    
    let formattedNumber = phoneNumber.replace(/\D/g, '');        
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+55' + formattedNumber;
    }      
    
    const message = await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_FROM}`, 
      to: `whatsapp:${formattedNumber}`, 
      body: `Seu código de verificação é: ${code}. Válido por 10 minutos.`
    });    
    
    return true;
  } catch (error) {
    console.error('[ERRO] Falha ao enviar mensagem WhatsApp:', error.message);
    
    // Logar detalhes adicionais do erro para diagnóstico
    if (error.code) {
      console.error('[ERRO] Código:', error.code);
    }
    
    if (error.moreInfo) {
      console.error('[ERRO] Mais informações:', error.moreInfo);
    }
    
    if (error.status) {
      console.error('[ERRO] Status HTTP:', error.status);
    }
    
    return false;
  }
}

router.post("/register", async (req, res) => {
  const {name, email, password} = req.body;  

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try{
    const user = await prisma.user.findUnique({
      where: {email}
    });

    if(user){
      return res.status(401).json({
        message: 'Usuário já cadastrado'
      });
    }

    const response = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        }
    });    
    res.status(201).json(response);

  } catch (error) {    
    res.status(500).json({
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }  
});

router.post("/login", async (req, res) => {
  const {email, password, recaptchaToken} = req.body;
  
  // Verificar o token do reCAPTCHA
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
    
    // Criar token temporário com o código 2FA
    const tempToken = jwt.sign({
      userId: user.id,
      email: user.email,
      twoFactorCode: twoFactorCode,
      step: '2fa-pending'
    }, JWT_SECRET, {expiresIn: '10m'});
    
    // Enviar código via WhatsApp    
    if (!user.phoneNumber) {
      console.log(`[AVISO] Usuário ${user.email} não tem número de telefone cadastrado.`);
      
      // No ambiente de desenvolvimento, permitir login sem 2FA
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Bypass 2FA para ${user.email} - número não cadastrado`);
        
        // Gerar token completo de acesso
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
      
      return res.status(400).json({
        message: 'Número de telefone não cadastrado. Contacte o administrador.'
      });
    }    
    
    const messageSent = await sendTwoFactorCodeWhatsApp(user.phoneNumber, twoFactorCode);
    
    if (!messageSent) {
      // No ambiente de desenvolvimento, permitir login sem 2FA se o envio falhar
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Bypass 2FA para ${user.email} - falha no envio`);
        
        // Gerar token completo de acesso
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
        message: 'Erro ao enviar código de verificação. Por favor, tente novamente.'
      });
    }
    
    // Retornar token temporário e informações básicas do usuário
    res.status(200).json({
      message: 'Primeira etapa concluída. Verifique o código enviado por WhatsApp.',
      tempToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      requireTwoFactor: true
    });

  } catch (error) {    
    res.status(500).json({
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
});

// verificação do código 2FA
router.post("/verify-2fa", async (req, res) => {
  const { tempToken, code } = req.body;
  
  if (!tempToken || !code) {
    return res.status(400).json({
      message: 'Token temporário e código são obrigatórios'
    });
  }
  
  try {    
    const decoded = jwt.verify(tempToken, JWT_SECRET);    
    
    if (decoded.step !== '2fa-pending') {
      return res.status(400).json({
        message: 'Token inválido ou expirado'
      });
    }    
    
    if (decoded.twoFactorCode !== code) {
      return res.status(401).json({
        message: 'Código de verificação inválido'
      });
    }    
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }
    
    // Gerar token de acesso completo
    const token = jwt.sign({
      userId: user.id,
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' });
    
    // Retornar token de acesso e informações do usuário
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    // Tratar erros de token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Tempo para verificação expirado. Por favor, faça login novamente.'
      });
    }
    
    res.status(500).json({
      message: 'Erro ao verificar código',
      error: error.message
    });
  }
});

export default router;
