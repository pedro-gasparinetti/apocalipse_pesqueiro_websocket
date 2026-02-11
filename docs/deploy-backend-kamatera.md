# Deploy Backend no Kamatera (Vercel + VPS)

## Arquitetura
- **Frontend**: Vercel (Next.js)
- **Backend**: Kamatera VPS (Socket.IO + PostgreSQL)

---

## 🚀 Deploy Inicial no VPS

### 1. Parar containers antigos
```bash
# Para tudo
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker network prune -f
```

### 2. Clonar/Atualizar repositório
```bash
cd ~/projects/apocalipse_pesqueiro_websocket
git pull
```

### 3. Configurar variáveis de ambiente
Edite o arquivo `.env` no VPS:
```bash
nano .env
```

Conteúdo do `.env`:
```env
# Socket Configuration
SOCKET_PORT=3005

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=prosperitylake
```

**IMPORTANTE**: `DB_HOST=postgres` (nome do container), não `localhost`!

### 4. Deploy backend-only
```bash
# Use o docker-compose correto (backend-only)
docker-compose -f docker-compose.backend.yml up -d --build

# Monitore os logs
docker-compose -f docker-compose.backend.yml logs -f
```

---

## 🔄 Atualizar Deploy

Sempre que fizer mudanças no código:

```bash
cd ~/projects/apocalipse_pesqueiro_websocket
git pull
docker-compose -f docker-compose.backend.yml down
docker-compose -f docker-compose.backend.yml up -d --build
docker-compose -f docker-compose.backend.yml logs -f
```

Ou use o script:
```bash
./deploy-backend.sh
```

---

## ✅ Verificar se está funcionando

### Verificar containers
```bash
docker ps
```

Deve mostrar:
- `apocalipse_backend` (porta 3005)
- `apocalipse_db` (porta 5432)

### Verificar logs
```bash
# Ver logs do backend
docker-compose -f docker-compose.backend.yml logs backend

# Ver logs do PostgreSQL
docker-compose -f docker-compose.backend.yml logs postgres

# Seguir logs em tempo real
docker-compose -f docker-compose.backend.yml logs -f
```

### Testar conexão
```bash
# Testar se o Socket.IO está respondendo
curl http://localhost:3005

# Testar se o PostgreSQL está rodando
docker exec -it apocalipse_db psql -U postgres -d apocalipse_pesqueiro -c "SELECT COUNT(*) FROM games;"
```

---

## 🌐 Configurar Vercel

No painel do Vercel, configure a variável de ambiente:

```
NEXT_PUBLIC_SOCKET_URL=https://seu-dominio.com:3005
```

ou use o IP diretamente:
```
NEXT_PUBLIC_SOCKET_URL=http://SEU_IP_KAMATERA:3005
```

**IMPORTANTE**: O Vercel precisa acessar a porta 3005 do seu VPS. Configure o firewall!

---

## 🔐 Firewall (UFW)

```bash
# Permitir SSH, HTTP, HTTPS e Socket.IO
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3005
sudo ufw enable
sudo ufw status
```

---

## 🚨 Troubleshooting

### Erro: `ECONNREFUSED 127.0.0.1:5432`
❌ `.env` está com `DB_HOST=localhost`  
✅ Mude para `DB_HOST=postgres`

### Erro: `port is already allocated`
```bash
# Ver o que está usando a porta
sudo netstat -tlnp | grep 3005

# Parar tudo e reiniciar
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker-compose -f docker-compose.backend.yml up -d
```

### Erro: `network has active endpoints`
```bash
docker network prune -f
docker-compose -f docker-compose.backend.yml up -d --remove-orphans
```

### Banco de dados não conecta
```bash
# Verificar se o PostgreSQL está rodando
docker exec -it apocalipse_db pg_isready -U postgres

# Ver logs do banco
docker logs apocalipse_db

# Entrar no PostgreSQL
docker exec -it apocalipse_db psql -U postgres -d apocalipse_pesqueiro
```

---

## 📊 Comandos Úteis

```bash
# Status dos containers
docker-compose -f docker-compose.backend.yml ps

# Parar containers
docker-compose -f docker-compose.backend.yml down

# Reiniciar um serviço específico
docker-compose -f docker-compose.backend.yml restart backend

# Ver uso de recursos
docker stats

# Limpar recursos não usados
docker system prune -a --volumes
```

---

## 📝 Checklist de Deploy

- [ ] Git pull no VPS
- [ ] `.env` configurado com `DB_HOST=postgres`
- [ ] Porta 3005 liberada no firewall
- [ ] Usar `docker-compose.backend.yml` (não o `.yml` normal)
- [ ] Verificar logs sem erros
- [ ] Atualizar `NEXT_PUBLIC_SOCKET_URL` no Vercel
- [ ] Testar conexão do frontend com backend

---

## ⚠️ Não Usar

❌ **Não use** `docker-compose.yml` (esse tem frontend também)  
❌ **Não use** `DB_HOST=localhost` no VPS  
❌ **Não use** PM2 quando estiver usando Docker

✅ **Use sempre** `docker-compose.backend.yml`
