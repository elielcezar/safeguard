import './config.js';
import express from "express";
import auth from './middlewares/auth.js';
import cors from 'cors';

import register from "./routes/register.js";
import login from "./routes/login.js";
import verify2fa from "./routes/verify-2fa.js";
import listPasswords from "./routes/list-passwords.js";
import password from "./routes/password.js";
import newPassword from "./routes/new-password.js";
import updatePassword from "./routes/update-password.js";
import deletePassword from "./routes/delete-password.js";
import newClient from "./routes/new-client.js";
import listClients from "./routes/list-clients.js";
import getClient from "./routes/get-client.js";
import updateUser from "./routes/update-user.js";
import updateClient from "./routes/update-client.js";
import deleteClient from "./routes/delete-client.js";

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
//Public
app.use('/api', register);
app.use('/api', login);
app.use('/api', verify2fa);
//Private
app.use('/api', auth, listPasswords);
app.use('/api', auth, password);
app.use('/api', auth, newPassword);
app.use('/api', auth, updatePassword);
app.use('/api', auth, deletePassword);
app.use('/api', auth, newClient);
app.use('/api', auth, listClients);
app.use('/api', auth, getClient);
app.use('/api', auth, updateUser);
app.use('/api', auth, updateClient);
app.use('/api', auth, deleteClient);

const PORT = process.env.PORT || 6699;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

