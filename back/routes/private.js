import express from "express";
import prisma from '../prisma/client.js';

const router = express.Router();

router.get("/list-passwords", async (req, res) => {
  try{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
        message: 'Token não informado'
        });
    }
    
    const passwords = await prisma.pass.findMany();

    res.status(200).json({
      message: 'Lista de senhas',
      passwords
    });
  }catch(error){
    console.error('Erro ao listar senhas:', error);
    res.status(500).json({
      message: 'Erro ao listar senhas',
      error: error.message
    });
  }
});

// Rota para buscar uma senha específica pelo ID
router.get("/password/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const password = await prisma.pass.findUnique({
      where: { id }
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

router.post("/new-password", async (req, res) => {
  try{
    const { client, service, username, password, extra } = req.body;

    const newPassword = await prisma.pass.create({
      data: {
        client,
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

router.put("/update-password/:id", async (req, res) => {
  try{
    const id = parseInt(req.params.id);
    const { client, service, username, password, extra } = req.body;
    
    // Verificar se a senha existe
    const existingPassword = await prisma.pass.findUnique({
      where: { id }
    });
    
    if (!existingPassword) {
      return res.status(404).json({
        message: 'Senha não encontrada'
      });
    }
    
    // Atualizar a senha
    const updatedPassword = await prisma.pass.update({
      where: { id },
      data: {
        client,
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
