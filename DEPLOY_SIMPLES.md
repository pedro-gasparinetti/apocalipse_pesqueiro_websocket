# 🚀 Deploy Simples - Kamatera com Docker

## Configuração Inicial (Fazer UMA VEZ)

No seu servidor Kamatera via SSH:

```bash
# 1. Clone o repositório
git clone SEU_REPO_URL
cd apocalipse_pesqueiro_websocket

# 2. Crie o arquivo .env  
cat > .env << 'EOF'
SOCKET_PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_FORTE_AQUI
NEXT_PUBLIC_SOCKET_URL=http://SEU_IP_AQUI:3001
NODE_ENV=production
EOF

# 3. Torne o script executável
chmod +x deploy.sh

# 4. Primeira execução
docker-compose up -d --build
```

**Pronto! Aplicação rodando!** 🎉

---

## Para Atualizar (Sempre que fizer mudanças)

É só fazer:

```bash
cd apocalipse_pesqueiro_websocket
./deploy.sh
```

**OU** se preferir passo a passo manual:

```bash
git pull
docker-compose up -d --build
```

---

## Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver status dos containers
docker-compose ps

# Reiniciar tudo
docker-compose restart

# Parar tudo
docker-compose down

# Apagar banco de dados e recomeçar (⚠️ CUIDADO)
docker-compose down -v
docker-compose up -d --build
```

---

## Resolução de Problemas

### Container não inicia?
```bash
# Ver o erro
docker-compose logs app

# Reconstruir do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Erro de porta em uso?
```bash
# Ver o que está usando a porta
sudo netstat -tlnp | grep -E '3000|3001'

# Matar processo específico
sudo kill -9 PID_NUMBER
```

### Atualizar apenas o código (sem rebuild do banco)
```bash
git pull
docker-compose up -d --build app
```

---

## 🎯 Resumo Ultra Simples

1. **Setup inicial**: Configure `.env` com sua senha e IP
2. **Deploy**: `./deploy.sh` ou `docker-compose up -d --build`
3. **Atualizar**: `git pull && docker-compose up -d --build`

**Não precisa de:**
- ❌ Instalar Node.js
- ❌ Instalar PostgreSQL
- ❌ Configurar PM2
- ❌ npm install
- ❌ npm run build

**Docker faz tudo automaticamente!** ✨
