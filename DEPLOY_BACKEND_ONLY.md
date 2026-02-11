# 🚀 Deploy Backend Only - Kamatera

## Arquitetura

- **Frontend**: Vercel (Next.js)
- **Backend**: Kamatera (Socket.IO + PostgreSQL + APIs)
- **Domínio**: backend.prosperitylake.club

---

## 📋 Setup Inicial no Kamatera

### 1. Clone e configure

```bash
cd /root/projects
git clone SEU_REPO_URL apocalipse_pesqueiro_websocket
cd apocalipse_pesqueiro_websocket

# Criar .env
nano .env
```

Cole no `.env`:
```env
SOCKET_PORT=3005
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=SuaSenhaForteAqui123!
NODE_ENV=production
```

### 2. Tornar scripts executáveis

```bash
chmod +x deploy-backend.sh
```

### 3. Subir backend

```bash
docker-compose -f docker-compose.backend.yml up -d --build
```

### 4. Verificar logs

```bash
docker-compose -f docker-compose.backend.yml logs -f
```

Quando ver `[SOCKET-SERVER] Ready on http://localhost:3005`, está pronto! ✅

---

## 🔄 Para Atualizar

Sempre que fizer mudanças no código:

```bash
cd /root/projects/apocalipse_pesqueiro_websocket
./deploy-backend.sh
```

**OU** manualmente:

```bash
git pull
docker-compose -f docker-compose.backend.yml up -d --build
```

---

## ⚙️ Configurar Vercel (Frontend)

No dashboard do Vercel, adicione estas **Environment Variables**:

```env
NEXT_PUBLIC_SOCKET_URL=https://backend.prosperitylake.club
```

Depois faça redeploy no Vercel.

---

## 🔧 Nginx já está configurado

Seu nginx já aponta `backend.prosperitylake.club` para `localhost:3005`.

Apenas certifique-se que tem a rota do Socket.IO:

```bash
sudo nano /etc/nginx/sites-available/backend.prosperitylake.club
```

Adicione se não tiver:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Comandos Úteis

```bash
# Ver logs
docker-compose -f docker-compose.backend.yml logs -f

# Ver status
docker-compose -f docker-compose.backend.yml ps

# Reiniciar
docker-compose -f docker-compose.backend.yml restart

# Parar tudo
docker-compose -f docker-compose.backend.yml down

# Backup do banco
docker-compose -f docker-compose.backend.yml exec postgres pg_dump -U postgres apocalipse_pesqueiro > backup.sql
```

---

## ✅ Checklist

- [ ] Backend rodando no Kamatera
- [ ] PostgreSQL funcionando
- [ ] Nginx configurado
- [ ] SSL ativo (https)
- [ ] CORS configurado para Vercel
- [ ] Variável `NEXT_PUBLIC_SOCKET_URL` no Vercel
- [ ] Frontend conectando ao backend

---

## 🧪 Testar

```bash
# Testar localmente no servidor
curl http://localhost:3005

# Testar via domínio
curl https://backend.prosperitylake.club

# Ver conexões do PostgreSQL
docker-compose -f docker-compose.backend.yml exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

---

## 🆘 Troubleshooting

### Backend não conecta

```bash
# Ver logs
docker-compose -f docker-compose.backend.yml logs backend

# Verificar se porta está aberta
curl http://localhost:3005
```

### Banco não conecta

```bash
# Ver logs do postgres
docker-compose -f docker-compose.backend.yml logs postgres

# Entrar no postgres
docker-compose -f docker-compose.backend.yml exec postgres psql -U postgres -d apocalipse_pesqueiro
```

### Frontend não conecta

1. Verifique a variável `NEXT_PUBLIC_SOCKET_URL` no Vercel
2. Verifique CORS no `server.js`
3. Teste: abra console do browser (F12) e veja erros
