import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

// Adicione esta rota para listar todos os clientes
router.get("/clients", async (req, res) => {
  
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    res.status(200).json({
      message: 'Lista de clientes',
      clients
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      message: 'Erro ao listar clientes',
      error: error.message
    });
  }
});

export default router;