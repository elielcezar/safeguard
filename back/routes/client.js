import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.get("/client/:id", async (req, res) => {
    console.log('teste');
    try{
      const { id } = req.params;
      const client = await prisma.client.findUnique({
        where: { id: parseInt(id) }
      });
  
      res.status(200).json({
        message: 'Cliente encontrado',
          client
        });
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({
          message: 'Erro ao buscar cliente',
          error: error.message
        });
      }
  });

export default router;