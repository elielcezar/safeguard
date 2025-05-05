import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";

const router = express.Router();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/list-passwords", async (req, res) => {
  try{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
        message: 'Token não informado'
        });
    }
    
    const passwords = await prisma.pass.findMany();

    res.status(200).json({
      message: 'Lista de senhas',
      passwords
    });
  }catch(error){
    console.error('Erro ao listar senhas:', error);
    res.status(500).json({
      message: 'Erro ao listar senhas',
      error: error.message
    });
  }
});

router.post("/new-password", async (req, res) => {
  try{
    const { client, service, username, password, extra } = req.body;

    const newPassword = await prisma.pass.create({
      data: {
        client,
        service,
        username,
        password,
        extra
      }
    });

    res.status(200).json({
      message: 'Senha criada com sucesso',
      newPassword
    });
  }catch(error){
    console.error('Erro ao criar senha:', error);
    res.status(500).json({
      message: 'Erro ao criar senha',
      error: error.message
    });
  }
});

router.put("/update-password", async (req, res) => {
  try{
    const { id, name, password } = req.body;
  }catch(error){
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      message: 'Erro ao atualizar senha',
      error: error.message
    });
  }
});

export default router;
