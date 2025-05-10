import dotenv from 'dotenv';
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';


// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
//const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Verificar se JWT_SECRET foi carregado
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não encontrado no ambiente.');
  process.exit(1);
}

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
    }, JWT_SECRET, { expiresIn: '12h' });
    
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