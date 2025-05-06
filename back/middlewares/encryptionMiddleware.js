import { encrypt, decrypt } from '../utils/encryption.js';

const encryptedFields = {
  // Tabela 'Pass' com campos a serem encriptados
  Pass: ['client', 'service', 'username', 'password', 'extra'] 
};

// Middleware para encriptar campos antes de salvar no banco
export function encryptionMiddleware(prisma) {  
  
  // Intercepta operações de criação (create, createMany)
  prisma.$use(async (params, next) => {
    const { model, action, args } = params;
    
    // Verificar se o modelo possui campos para encriptar
    if (encryptedFields[model] && ['create', 'createMany', 'update', 'updateMany', 'upsert'].includes(action)) {      
      
      // Para operações de criação individual
      if (action === 'create' || action === 'update' || action === 'upsert') {
        const data = args.data;        
       
        // Encripta os campos definidos no mapeamento
        encryptedFields[model].forEach(field => {
          if (data[field] !== undefined && data[field] !== null) {            
            data[field] = encrypt(data[field]);
          }
        });       
       
      }
      
      // Para criação em massa (createMany)
      if (action === 'createMany' || action === 'updateMany') {
        const dataArray = args.data;
        if (Array.isArray(dataArray)) {
          dataArray.forEach(data => {
            encryptedFields[model].forEach(field => {
              if (data[field] !== undefined && data[field] !== null) {
                data[field] = encrypt(data[field]);
              }
            });
          });
        }
      }
    }    
    // Continua com a operação do Prisma
    return next(params);
  });
  
  // Intercepta operações de leitura (findUnique, findMany, findFirst)
  prisma.$use(async (params, next) => {
    const { model, action } = params;

    // Executa a consulta original
    const result = await next(params);
    
    // Verifica se o modelo possui campos para decriptar
    if (encryptedFields[model] && result && ['findUnique', 'findMany', 'findFirst'].includes(action)) {      
      
      // Para resultados únicos
      if (!Array.isArray(result)) {
        if (result) {
          encryptedFields[model].forEach(field => {
            if (result[field] !== undefined && result[field] !== null) {
              try {                
                result[field] = decrypt(result[field]);
              } catch (error) {
                console.error(`❌ Erro ao decriptar campo ${field}:`, error);
                // Em caso de erro, mantém o valor original (pode ser útil para migração)
              }
            }
          });
        }
      } 
      // Para arrays de resultados (findMany)
      else {
        result.forEach(item => {
          encryptedFields[model].forEach(field => {
            if (item[field] !== undefined && item[field] !== null) {
              try {
                item[field] = decrypt(item[field]);
              } catch (error) {
                console.error(`❌ Erro ao decriptar campo ${field}:`, error);
              }
            }
          });
        });
      }
    }
    
    return result;
  });  
  
  return prisma;
} 