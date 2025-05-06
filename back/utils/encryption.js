import dotenv from 'dotenv';
import crypto from 'crypto';
// Garantir que dotenv seja carregado neste arquivo também
dotenv.config();

const algorithm = 'aes-256-gcm';

if (!process.env.MASTER_KEY) {  
  throw new Error('MASTER_KEY não encontrada no process.env. Verifique se o arquivo .env está sendo carregado corretamente.');
}

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY, 'hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text) {
  try {    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, MASTER_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Retorna IV + dados criptografados + authTag
    const result = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;    
    return result;
  } catch (error) {
    console.error('[ERRO] Falha na criptografia:', error);
    throw error;
  }
}

function decrypt(encryptedData) {
  try {    
    
    if (!encryptedData || typeof encryptedData !== 'string') {
      console.error('[ERRO] Dados inválidos para descriptografia:', encryptedData);
      throw new Error('Dados de criptografia inválidos ou ausentes');
    }
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      console.error('[ERRO] Formato inválido de dados criptografados:', encryptedData);
      throw new Error('Formato inválido de dados criptografados');
    }
    
    const [ivHex, encrypted, authTagHex] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');    
    
    return decrypted;
  } catch (error) {
    console.error('[ERRO] Falha na descriptografia:', error);
    throw error;
  }
}

export { encrypt, decrypt };