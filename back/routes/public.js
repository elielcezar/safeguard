import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

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
  const {email, password} = req.body;  

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
