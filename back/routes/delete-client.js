import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

// Endpoint para excluir uma senha
router.delete("/delete-client/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar se o cliente existe
      const existingClient = await prisma.client.findUnique({
        where: { id }
      });
      
      if (!existingClient) {
        return res.status(404).json({
          message: 'Cliente não encontrado'
        });
      }
      
      // Excluir o cliente
      await prisma.client.delete({
        where: { id }
      });
  
      res.status(200).json({
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({
        message: 'Erro ao excluir cliente',
        error: error.message
      });
    }
  });

export default router;