import crypto from 'crypto';
import dotenv from 'dotenv';

// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const algorithm = 'aes-256-gcm';

// Verificar se MASTER_KEY existe
if (!process.env.MASTER_KEY) {
  console.error('ERRO: MASTER_KEY não encontrada no ambiente.');
  process.exit(1); // Encerrar o processo se a chave não for encontrada
}

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY, 'hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, MASTER_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Retorna IV + dados criptografados + authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

function decrypt(encryptedData) {
  const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, MASTER_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export { encrypt, decrypt };