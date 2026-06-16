import dotenv from 'dotenv';
import axios from 'axios';
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendTwoFactorCode } from '../utils/mailer.js';

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não encontrado no ambiente.');
  process.exit(1);
}

async function verifyRecaptcha(token) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Ambiente de desenvolvimento: reCAPTCHA simulado');
      return true;
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token } }
    );

    return response.data.success;
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error);
    return false;
  }
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(401).json({ message: 'Usuário já cadastrado' });
    }

    const response = await prisma.user.create({
      data: { name, email, password: hashedPassword, createdAt: new Date() }
    });

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'Verificação de reCAPTCHA necessária' });
  }

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return res.status(400).json({ message: 'Verificação de reCAPTCHA falhou. Por favor, tente novamente.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado. Por favor verifique suas credenciais.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Senha não confere. Por favor verifique suas credenciais.' });
    }

    const twoFactorCode = crypto.randomInt(100000, 999999).toString();

    const tempToken = jwt.sign({
      userId: user.id,
      email: user.email,
      twoFactorCode,
      step: '2fa-pending'
    }, JWT_SECRET, { expiresIn: '10m' });

    const emailSent = await sendTwoFactorCode(user.email, twoFactorCode);

    if (!emailSent) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Bypass 2FA para ${user.email} — falha no envio de e-mail`);
        console.log(`[DEV] Código 2FA: ${twoFactorCode}`);

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
          message: 'Login realizado com sucesso (2FA ignorado em desenvolvimento)',
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      }

      return res.status(500).json({ message: 'Erro ao enviar código de verificação. Por favor, tente novamente.' });
    }

    res.status(200).json({
      message: 'Primeira etapa concluída. Verifique o código enviado por e-mail.',
      tempToken,
      user: { id: user.id, name: user.name, email: user.email },
      requireTwoFactor: true
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ message: 'Token temporário e código são obrigatórios' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);

    if (decoded.step !== '2fa-pending') {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    if (decoded.twoFactorCode !== code) {
      return res.status(401).json({ message: 'Código de verificação inválido' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Tempo para verificação expirado. Por favor, faça login novamente.' });
    }

    res.status(500).json({ message: 'Erro ao verificar código', error: error.message });
  }
});

export default router;
