import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

// Endpoint para excluir uma senha
router.delete("/delete-password/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar se a senha existe
      const existingPassword = await prisma.pass.findUnique({
        where: { id }
      });
      
      if (!existingPassword) {
        return res.status(404).json({
          message: 'Senha não encontrada'
        });
      }
      
      // Excluir a senha
      await prisma.pass.delete({
        where: { id }
      });
  
      res.status(200).json({
        message: 'Senha excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir senha:', error);
      res.status(500).json({
        message: 'Erro ao excluir senha',
        error: error.message
      });
    }
  });

export default router;