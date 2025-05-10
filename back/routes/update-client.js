import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.put("/update-client/:id", async (req, res) => {
    try{
      const id = parseInt(req.params.id);
      const { name } = req.body;         
      
      const client = await prisma.client.findUnique({
        where: { id: id }
      });
      
      if (!client) {
        return res.status(400).json({
          message: 'Cliente não encontrado'
        });
      }
      
      // Atualizar a senha
      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          name,         
          updatedAt: new Date()
        }
      });
  
      res.status(200).json({
        message: 'Cliente atualizado com sucesso',
        client: updatedClient
      });
    }catch(error){
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({
        message: 'Erro ao atualizar cliente',
        error: error.message
      });
    }
  });

export default router;