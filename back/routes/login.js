import dotenv from 'dotenv';
import axios from 'axios';
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'; // Para gerar código aleatório de 2FA
import twilio from 'twilio'; 

// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
//const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

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

// Função para enviar código 2FA via WhatsApp
async function sendTwoFactorCodeWhatsApp(phoneNumber, code) {
  try {
    if (!phoneNumber) {
      console.error('[WhatsApp] Número de telefone não fornecido');
      return false;
    }

    // Formatar número para E.164 (padrão internacional)
    let formattedNumber = phoneNumber.toString().replace(/\D/g, '');
    
    // Adicionar código do país se necessário
    if (!formattedNumber.startsWith('55') && formattedNumber.length <= 11) {
      formattedNumber = '55' + formattedNumber;
    }
    
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    console.log(`[WhatsApp] Enviando código para: ${formattedNumber}`);
    
    // Verificar configurações essenciais
    if (!TWILIO_WHATSAPP_FROM) {
      console.error('[WhatsApp] TWILIO_WHATSAPP_FROM não configurado');
      return false;
    }
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    
    const fromWhatsApp = `whatsapp:${TWILIO_WHATSAPP_FROM}`;
    const toWhatsApp = `whatsapp:${formattedNumber}`;
    let message;    
    
    // MÉTODO 1: Template aprovado (produção)
    if (isProduction && process.env.TWILIO_WHATSAPP_TEMPLATE_SID) {
      try {
        console.log('[WhatsApp] Tentando envio via template aprovado...');
        
        message = await twilioClient.messages.create({
          from: fromWhatsApp,
          to: toWhatsApp,
          contentSid: process.env.TWILIO_WHATSAPP_TEMPLATE_SID,
          contentVariables: JSON.stringify({
            "1": code
          })
        });
        
        console.log(`[WhatsApp] Template enviado com sucesso. SID: ${message.sid}`);
        return true;
        
      } catch (templateError) {
        console.error(`[WhatsApp] Falha no template: ${templateError.message}`);
        console.log('[WhatsApp] Tentando método alternativo...');
      }
    }
    
    // MÉTODO 2: Mensagem livre (fallback)
    try {
      console.log('[WhatsApp] Enviando via mensagem livre...');
      
      message = await twilioClient.messages.create({
        from: fromWhatsApp,
        to: toWhatsApp,
        body: `🔐 *SafeGuard*\n\nSeu código de verificação é: *${code}*\n\nEste código é válido por 10 minutos.\n\n_Não compartilhe este código com ninguém._`
      });
      
      console.log(`[WhatsApp] Mensagem enviada com sucesso. SID: ${message.sid}`);
      return true;
      
    } catch (freeTextError) {
      console.error(`[WhatsApp] Erro ao enviar mensagem: ${freeTextError.message}`);
      
      // Log específico para erros conhecidos
      if (freeTextError.code === 63016) {
        console.error('[WhatsApp] Conta WhatsApp Business não aprovada');
      } else if (freeTextError.code === 63018) {
        console.error('[WhatsApp] Número não registrado no sandbox');
      }
      
      throw freeTextError;
    }

  } catch (error) {
    console.error(`[WhatsApp] Erro geral: ${error.message}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[WhatsApp] Dica: Configure o Twilio WhatsApp Sandbox para desenvolvimento');
    }
    
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
    
    // Verificar se o número de telefone existe
    if (!user.phoneNumber) {
      console.log(`[2FA] Número de telefone não cadastrado para: ${user.email}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Bypass 2FA para ${user.email} - número não cadastrado`);
        
        const token = jwt.sign({
          userId: user.id,
          email: user.email
        }, JWT_SECRET, {expiresIn: '12h'});
        
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
    
    console.log(`[2FA] Enviando código via WhatsApp para: ${user.email}`);
    
    const messageSent = await sendTwoFactorCodeWhatsApp(user.phoneNumber, twoFactorCode);    
    
    if (!messageSent) {
      console.error(`[2FA] Falha no envio do código para: ${user.email}`);
      
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
        message: 'Erro ao enviar código de verificação via WhatsApp. Tente novamente.',
        details: 'Falha na comunicação com o serviço de WhatsApp'
      });
    }
    
    console.log(`[2FA] Código enviado com sucesso para: ${user.email}`);
    
    // Retornar token temporário
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
    console.error(`[Login] Erro: ${error.message}`);
    res.status(500).json({
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
});

export default router;
