import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.post("/new-password", async (req, res) => {
    try{
      const { clientId, service, username, password, extra } = req.body;
  
      // Garantir que clientId seja um número
      const clientIdNumber = clientId ? parseInt(clientId) : null;
  
      console.log('clientId (tipo):', typeof clientIdNumber, clientIdNumber);
  
      const newPassword = await prisma.pass.create({
        data: {
          clientId: clientIdNumber,
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

export default router;