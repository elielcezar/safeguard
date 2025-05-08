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
    
    const passwords = await prisma.pass.findMany({
      include: {
        client: true
      }
    });

    // Log para debug
    if (passwords.length > 0) {
      console.log('Primeiro item (Prisma):', JSON.stringify(passwords[0], null, 2));
      console.log('Client do primeiro item:', passwords[0].client);
    }

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

// Adicione esta rota para listar todos os clientes
router.get("/clients", async (req, res) => {
  
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    res.status(200).json({
      message: 'Lista de clientes',
      clients
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      message: 'Erro ao listar clientes',
      error: error.message
    });
  }
});

export default router;
