import express from "express";
import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.put("/update-user/:id", async (req, res) => {    
    const { id, name, email, password } = req.body;    

    try {              
    
        if (!id || !name || !email) {
            return res.status(400).json({ error: 'Dados incompletos. ID, nome e email são obrigatórios.' });
        }
    
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
    
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
    
        const dataUpdate = {
            name,
            email        
        }    
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            dataUpdate.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataUpdate
        });

        res.status(200).json({
            message: 'Usuário atualizado com sucesso', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

export default router;

