import { PrismaClient } from '@prisma/client';
import { encryptionMiddleware } from '../middlewares/encryptionMiddleware.js';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

// Aplica o middleware de encriptação
const prismaWithEncryption = encryptionMiddleware(prisma);

export default prismaWithEncryption; 