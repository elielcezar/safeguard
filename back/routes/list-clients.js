import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

// Adicione esta rota para listar todos os clientes
router.get("/clients", async (req, res) => {
  console.log('Iniciando listagem de clientes');
  console.log('Prisma client:', prisma ? 'inicializado' : 'não inicializado');
  console.log('Prisma client type:', typeof prisma);
  
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('Clientes encontrados:', clients.length);
    
    res.status(200).json({
      message: 'Lista de clientes',
      clients
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: 'Erro ao listar clientes',
      error: error.message
    });
  }
});

export default router;