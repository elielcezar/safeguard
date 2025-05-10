import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.put("/update-password/:id", async (req, res) => {
    try{
      const id = parseInt(req.params.id);
      const { clientId, service, username, password, extra } = req.body;
      
      // Garantir que clientId seja um número
      const clientIdNumber = clientId ? parseInt(clientId) : null;
      
      console.log('clientId (tipo) na atualização:', typeof clientIdNumber, clientIdNumber);
      
      // Verificar se o cliente existe
      if (clientIdNumber) {
        const clientExists = await prisma.client.findUnique({
          where: { id: clientIdNumber }
        });
        
        if (!clientExists) {
          return res.status(400).json({
            message: 'Cliente não encontrado'
          });
        }
      }
      
      // Atualizar a senha
      const updatedPassword = await prisma.pass.update({
        where: { id },
        data: {
          clientId: clientIdNumber,
          service,
          username,
          password,
          extra,
          updatedAt: new Date()
        }
      });
  
      res.status(200).json({
        message: 'Senha atualizada com sucesso',
        password: updatedPassword
      });
    }catch(error){
      console.error('Erro ao atualizar senha:', error);
      res.status(500).json({
        message: 'Erro ao atualizar senha',
        error: error.message
      });
    }
  });

export default router;