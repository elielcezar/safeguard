import { encrypt, decrypt } from '../utils/encryption.js';

const encryptedFields = {
  // Tabela 'Pass' com campos a serem encriptados
  Pass: ['client', 'service', 'username', 'password', 'extra'] 
};

// Middleware para encriptar campos antes de salvar no banco (Prisma v5+)
export function encryptionMiddleware(prisma) {
  
  // Função auxiliar para decriptar campos
  function decryptFields(item, model) {
    if (!item) return;
    encryptedFields[model]?.forEach(field => {
      if (item[field] !== undefined && item[field] !== null && typeof item[field] === 'string') {
        try {
          item[field] = decrypt(item[field]);
        } catch (error) {
          console.error(`Erro ao decriptar campo ${field}:`, error);
        }
      }
    });
  }
  
  // Nova API do Prisma v5+ usando $extends
  return prisma.$extends({
    query: {
      $allModels: {
        // Intercepta operações de escrita
        async create({ model, operation, args, query }) {
          if (encryptedFields[model] && args.data) {
            encryptedFields[model].forEach(field => {
              if (args.data[field] !== undefined && args.data[field] !== null) {
                try {
                  args.data[field] = encrypt(args.data[field]);
                } catch (error) {
                  throw error;
                }
              }
            });
          }
          return query(args);
        },
        
        async update({ model, operation, args, query }) {
          if (encryptedFields[model] && args.data) {
            encryptedFields[model].forEach(field => {
              if (args.data[field] !== undefined && args.data[field] !== null) {
                try {
                  args.data[field] = encrypt(args.data[field]);
                } catch (error) {
                  throw error;
                }
              }
            });
          }
          return query(args);
        },
        
        async upsert({ model, operation, args, query }) {
          if (encryptedFields[model]) {
            ['create', 'update'].forEach(key => {
              if (args[key]) {
                encryptedFields[model].forEach(field => {
                  if (args[key][field] !== undefined && args[key][field] !== null) {
                    try {
                      args[key][field] = encrypt(args[key][field]);
                    } catch (error) {
                      throw error;
                    }
                  }
                });
              }
            });
          }
          return query(args);
        },
        
        // Intercepta operações de leitura
        async findUnique({ model, operation, args, query }) {
          const result = await query(args);
          if (result && encryptedFields[model]) {
            decryptFields(result, model);
          }
          return result;
        },
        
        async findFirst({ model, operation, args, query }) {
          const result = await query(args);
          if (result && encryptedFields[model]) {
            decryptFields(result, model);
          }
          return result;
        },
        
        async findMany({ model, operation, args, query }) {
          const result = await query(args);
          if (result && Array.isArray(result) && encryptedFields[model]) {
            result.forEach(item => decryptFields(item, model));
          }
          return result;
        }
      }
    }
  });
} 