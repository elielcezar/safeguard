import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client';
import express from "express";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  const {name, email, password} = req.body;  

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try{
    const user = await prisma.user.findUnique({
      where: {email}
    });

    if(user){
      return res.status(401).json({
        message: 'Usuário já cadastrado'
      });
    }

    const response = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        }
    });    
    res.status(201).json(response);

  } catch (error) {    
    res.status(500).json({
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }  
});

export default router;