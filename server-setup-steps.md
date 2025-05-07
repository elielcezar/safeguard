# Reiniciar serviço com ecosystem
pm2 start ecosystem.config.cjs --env production

# Passos para Completar a Configuração no Servidor

Siga estes passos para finalizar a configuração do seu aplicativo Safe Password Manager no servidor:

## 1. Criar uma Configuração Inicial do Nginx

Antes de obter o certificado SSL, precisamos criar uma configuração básica do Nginx para o Certbot reconhecer seu domínio:

1. Faça login no seu servidor VPS via SSH:
   ```bash
   ssh seu_usuario@seu_servidor
   ```

2. Crie um arquivo de configuração inicial para seu domínio:
   ```bash
   sudo nano /etc/nginx/sites-available/safe.ecwd.pro
   ```

3. Adicione a configuração básica (apenas com o server_name para o Certbot reconhecer):
   ```nginx
   server {
       listen 80;
       server_name safe.ecwd.pro;
       
       # Configuração temporária apenas para obtenção do certificado SSL
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

4. Salve o arquivo (Ctrl+O, Enter, Ctrl+X)

5. Crie um link simbólico para habilitar o site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/safe.ecwd.pro /etc/nginx/sites-enabled/
   ```

6. Verifique se a configuração está correta:
   ```bash
   sudo nginx -t
   ```

7. Recarregue o Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## 2. Obter Certificado SSL para o subdomínio

Agora que temos a configuração básica, podemos obter o certificado:

1. Instale o Certbot se ainda não estiver instalado:
   ```bash
   # Para Ubuntu/Debian
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   
   # Para CentOS/RHEL
   sudo yum install certbot python3-certbot-nginx
   ```

2. Obtenha o certificado SSL para seu subdomínio:
   ```bash
   sudo certbot --nginx -d safe.ecwd.pro
   ```

3. Siga as instruções interativas do Certbot:
   - Forneça seu endereço de e-mail para notificações
   - Concorde com os termos de serviço
   - Escolha se deseja compartilhar seu e-mail com a EFF
   - O Certbot tentará configurar automaticamente o Nginx

4. Verifique se os certificados foram gerados:
   ```bash
   ls -la /etc/letsencrypt/live/safe.ecwd.pro/
   ```
   
   Você deve ver arquivos como `fullchain.pem` e `privkey.pem`

## 3. Atualizar a Configuração do Nginx

Agora que temos o certificado SSL, vamos configurar o Nginx com nossa configuração completa:

1. Abra o arquivo de configuração do Nginx para seu site:
   ```bash
   sudo nano /etc/nginx/sites-available/safe.ecwd.pro
   ```

2. Substitua o conteúdo atual pelo conteúdo do arquivo `nginx-config.conf` que criamos
   (certifique-se de ajustar os caminhos conforme necessário para seu ambiente)

3. Salve o arquivo (Ctrl+O, Enter, Ctrl+X)

4. Verifique se a configuração do Nginx está correta:
   ```bash
   sudo nginx -t
   ```

5. Se o teste for bem-sucedido, recarregue o Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## 4. Preparar os Diretórios para a Aplicação

1. Crie a estrutura de diretórios necessária:
   ```bash
   sudo mkdir -p /var/www/safe.ecwd.pro/front/dist
   sudo mkdir -p /var/www/safe.ecwd.pro/back
   ```

2. Defina as permissões corretas:
   ```bash
   sudo chown -R $USER:$USER /var/www/safe.ecwd.pro
   # Ou use www-data se o Nginx estiver executando como www-data
   # sudo chown -R www-data:www-data /var/www/safe.ecwd.pro
   ```

## 5. Implantação da Aplicação

Certifique-se de que seus arquivos estão nos lugares corretos:

1. O frontend deve estar em `/var/www/safe.ecwd.pro/front/dist`
   - Se estiver em outro local, você pode usar um link simbólico:
     ```bash
     # Se os arquivos estiverem em ~/frontend-build
     sudo ln -sf ~/frontend-build/* /var/www/safe.ecwd.pro/front/dist/
     ```

2. O backend deve estar em execução na porta 6699
   - Copie os arquivos do backend para o diretório correto:
     ```bash
     # Se os arquivos estiverem em ~/backend
     cp -r ~/backend/* /var/www/safe.ecwd.pro/back/
     ```
   - Configure e inicie o backend:
     ```bash
     cd /var/www/safe.ecwd.pro/back
     npm install
     
     # Configurar o arquivo .env
     echo "MASTER_KEY=dee2107166b19e6121c7ce55e11fc90168b699162429acc1c18cac8784fa6f42" > .env
     echo "JWT_SECRET=seu_jwt_secret_seguro_aqui" >> .env
     
     # Instalar PM2 se necessário
     npm install -g pm2
     
     # Iniciar o backend - CERTIFIQUE-SE DE ESTAR NO DIRETÓRIO CORRETO
     cd /var/www/safe.ecwd.pro/back
     pm2 start server.js --name safe-backend
     pm2 save
     pm2 startup
     ```

## 6. Correção de Erros 502 Bad Gateway

Se você estiver enfrentando erros 502 e os logs do PM2 mostrarem erros relacionados a arquivos não encontrados (como `/root/package.json`), siga estas etapas:

1. Pare todas as instâncias do seu aplicativo no PM2:
   ```bash
   pm2 stop all
   pm2 delete all
   ```

2. Inicie o aplicativo novamente a partir do diretório correto:
   ```bash
   cd /var/www/safe.ecwd.pro/back
   pm2 start server.js --name safe-backend
   ```

3. Verifique se o aplicativo está rodando na porta correta:
   ```bash
   # Verificar se há um processo escutando na porta 6699
   sudo netstat -tulpn | grep 6699
   
   # Ou, se netstat não estiver disponível
   sudo lsof -i :6699
   ```

4. Se a porta estiver diferente, atualize a configuração do Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/safe.ecwd.pro
   ```
   
   Altere a linha `proxy_pass http://localhost:6699/;` para a porta correta.

5. Se o aplicativo não estiver iniciando corretamente, verifique os logs:
   ```bash
   pm2 logs safe-backend
   ```

6. Verifique se o arquivo `server.js` existe e tem as permissões corretas:
   ```bash
   ls -la /var/www/safe.ecwd.pro/back/server.js
   ```

7. Execute o aplicativo manualmente para verificar se há erros:
   ```bash
   cd /var/www/safe.ecwd.pro/back
   node server.js
   ```

## 7. Configuração de API

Se o seu frontend precisa se comunicar com o backend através de `/api`:

1. Verifique se o arquivo `.env` (ou equivalente) do frontend tem a URL de API configurada corretamente:
   ```
   VITE_API_URL=https://safe.ecwd.pro/api
   ```

2. Se necessário, reconstrua o frontend com as variáveis de ambiente corretas.

## 8. Testar a Aplicação

1. Acesse https://safe.ecwd.pro no seu navegador
2. Verifique os logs em caso de problemas:
   ```bash
   sudo tail -f /var/log/nginx/safe.ecwd.pro.error.log  # Logs do Nginx
   pm2 logs  # Logs do backend (se estiver usando PM2)
   ```

## 9. Configuração de Renovação Automática do SSL

Os certificados Let's Encrypt expiram após 90 dias. Configure a renovação automática:

```bash
# Testar o processo de renovação (sem realmente renovar)
sudo certbot renew --dry-run

# Verificar se o cron job para renovação automática está configurado
sudo systemctl status certbot.timer
```

## Solução de Problemas Comuns

### Erro 502 Bad Gateway
- Verifique se o backend está rodando na porta correta
- Verifique as permissões de acesso
- Certifique-se de que o PM2 está executando o aplicativo do diretório correto
- Verifique os logs do PM2 e do Nginx para identificar o problema específico

### Erro 404 ao Recarregar Páginas
- Verifique se a configuração `try_files $uri $uri/ /index.html;` está presente

### Certificado SSL Inválido
- Verifique se o Certbot configurou corretamente os certificados
- Certifique-se de que seu domínio está apontando corretamente para seu servidor
- Renove os certificados manualmente se necessário:
  ```bash
  sudo certbot renew --force-renewal
  ```

### Se o Certbot não conseguir completar a verificação de domínio
- Verifique se o DNS está configurado corretamente para o subdomínio
- Certifique-se de que a porta 80 está acessível externamente (necessário para a verificação HTTP) 