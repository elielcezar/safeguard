import './config.js';
import express from "express";
import publicRoutes from "./routes/public.js";  
import privateRoutes from "./routes/private.js";
import auth from './middlewares/auth.js';
import cors from 'cors';

// Verificar se as variáveis essenciais foram carregadas
const MASTER_KEY = process.env.MASTER_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

console.log('Verificando variáveis no servidor:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RECAPTCHA_SECRET_KEY configurada:', RECAPTCHA_SECRET_KEY ? 'Sim' : 'Não');

if (!MASTER_KEY || !JWT_SECRET) {
  console.error('ERRO: Variáveis de ambiente essenciais não foram carregadas.');  
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', publicRoutes);
app.use('/api', auth, privateRoutes);

const PORT = process.env.PORT || 6699;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

