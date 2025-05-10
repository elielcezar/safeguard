import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.get("/list-passwords", async (req, res) => {
  try{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
        message: 'Token não informado'
        });
    }
    
    const passwords = await prisma.pass.findMany({
      include: {
        client: true
      }
    });

    // Log para debug
    if (passwords.length > 0) {
      console.log('Primeiro item (Prisma):', JSON.stringify(passwords[0], null, 2));
      console.log('Client do primeiro item:', passwords[0].client);
    }

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

export default router;