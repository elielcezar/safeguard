import dotenv from 'dotenv';
import express from "express";
import publicRoutes from "./routes/public.js";  
import privateRoutes from "./routes/private.js";
import auth from './middlewares/auth.js';
import cors from 'cors';

dotenv.config();

if (!process.env.MASTER_KEY) {
  console.log('MASTER_KEY não foi carregada pelo dotenv, definindo manualmente');
  process.env.MASTER_KEY = 'dee2107166b19e6121c7ce55e11fc90168b699162429acc1c18cac8784fa6f42';
}

const app = express();

app.use(express.json());
app.use(cors());
app.use(publicRoutes);
app.use(auth, privateRoutes);

app.listen(6699, () => {
  console.log("Server is running on port 6699");
});

