import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.post("/clients", async (req, res) => {
    console.log(req.body);
    
    try{
      const { name } = req.body;
  
      const existingClient = await prisma.client.findFirst({
        where: { name }
      });
  
      if(existingClient){
        return res.status(400).json({
          message: 'Cliente já existe'
        });
      }
      
      const newClient = await prisma.client.create({
        data: {
          name
        }
      });    
      res.status(200).json({
        message: 'Cliente criado com sucesso',
        client: newClient
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({
        message: 'Erro ao criar cliente',
        error: error.message
      });
    }
  });

export default router;