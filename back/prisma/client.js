import { PrismaClient } from '@prisma/client';
import { encryptionMiddleware } from '../middlewares/encryptionMiddleware.js';

// Criando uma instância global do PrismaClient para evitar múltiplas conexões
let prisma;

// Verificar se já existe uma instância global
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    });
  } else {
    // Em desenvolvimento, usa o padrão
    prisma = new PrismaClient();
  }
  
  // Em desenvolvimento, registrar no objeto global
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} else {
  prisma = globalForPrisma.prisma;
}

// Aplica o middleware de encriptação
const prismaWithEncryption = encryptionMiddleware(prisma);

console.log('Cliente Prisma inicializado com sucesso');

export default prismaWithEncryption; 