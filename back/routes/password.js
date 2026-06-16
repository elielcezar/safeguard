import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

// Rota para buscar uma senha específica pelo ID
router.get("/password/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const password = await prisma.pass.findUnique({
        where: { id },
        include: {
          client: true
        }
      });
      
      if (!password) {
        return res.status(404).json({
          message: 'Senha não encontrada'
        });
      }
      
      res.status(200).json({
        message: 'Senha encontrada',
        password
      });
    } catch (error) {
      console.error('Erro ao buscar senha:', error);
      res.status(500).json({
        message: 'Erro ao buscar senha',
        error: error.message
      });
    }
  });

export default router;