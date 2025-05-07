import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';

// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

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
  
  // Verificar o token com a API do Google
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

    const token = jwt.sign({
      userId: user.id,
      email: user.email
    }, JWT_SECRET, {expiresIn: '1h'});   

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
    res.status(500).json({
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
});

export default router;
