import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ESM - obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para o arquivo .env
const envPath = path.resolve(__dirname, '.env');

console.log('[DEBUG] Tentando carregar .env de:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[ERRO] Falha ao carregar o arquivo .env:', result.error);
} else {
  console.log('[INFO] .env carregado com sucesso');
  console.log('[INFO] MASTER_KEY presente:', !!process.env.MASTER_KEY);
} 