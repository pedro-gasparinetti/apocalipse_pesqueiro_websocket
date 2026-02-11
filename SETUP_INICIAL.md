# ⚡ Configuração Inicial - Uma Vez Só

Execute estes comandos **UMA VEZ** no seu servidor Kamatera:

```bash
# 1. Clone o repositório
cd /home
git clone SEU_REPO_URL apocalipse_pesqueiro
cd apocalipse_pesqueiro

# 2. Crie o arquivo de configuração .env
nano .env
```

Cole isto no `.env` (edite os valores):
```env
SOCKET_PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=ColoqueSenhaForteAqui123!
NEXT_PUBLIC_SOCKET_URL=http://SEU_IP_DO_SERVIDOR:8001
NODE_ENV=production
```

Salve com `Ctrl+X`, depois `Y`, depois `Enter`.

```bash
# 3. Torne o script de deploy executável
chmod +x deploy.sh

# 4. Suba a aplicação pela primeira vez
docker-compose up -d --build

# 5. Aguarde uns 30 segundos e veja os logs
docker-compose logs -f
```

Quando ver "✅ All services started!", está pronto!

Pressione `Ctrl+C` para sair dos logs.

---

## ✅ Pronto!

Acesse no navegador:
- **http://SEU_IP:8000** (aplicação)
- **http://SEU_IP:8000/api/health** (status)

---

## 🔄 Para Atualizar Depois

Sempre que você fizer `git push` do seu código, no servidor execute:

```bash
cd /home/apocalipse_pesqueiro
./deploy.sh
```

**Pronto! Mais nada.**

---

## 📝 Comandos Úteis

```bash
# Ver se está rodando
docker-compose ps

# Ver logs ao vivo
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar
docker-compose restart
```
