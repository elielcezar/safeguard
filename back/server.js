import dotenv from 'dotenv';
import express from "express";
import publicRoutes from "./routes/public.js";  
import privateRoutes from "./routes/private.js";
import auth from './middlewares/auth.js';
import cors from 'cors';

// Carregar variáveis de ambiente no início
dotenv.config();

// Verificar se as variáveis essenciais foram carregadas
const MASTER_KEY = process.env.MASTER_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MASTER_KEY || !JWT_SECRET) {
  console.error('ERRO: Variáveis de ambiente essenciais não foram carregadas.');  
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', publicRoutes);
app.use('/api', auth, privateRoutes);

app.listen(6699, () => {
  console.log("Server is running on port 6699");
});

