# Apocalipse Pesqueiro - Jogo Experimental

Um jogo multiplayer sobre gestão sustentável de recursos naturais.

## 🚀 Deploy no Kamatera (MAIS SIMPLES)

Como você já tem Docker rodando no Kamatera:

### 1. Configuração Inicial (uma vez só)
```bash
git clone seu-repo-url
cd apocalipse_pesqueiro_websocket
cp .env.production .env
nano .env  # Edite com sua senha e IP
docker-compose up -d --build
```

### 2. Para atualizar (sempre que mudar código)
```bash
./deploy.sh
```

**Pronto!** Veja o guia completo em [SETUP_INICIAL.md](SETUP_INICIAL.md)

---

## 💻 Desenvolvimento Local

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

---

## 📚 Documentação

- **[SETUP_INICIAL.md](SETUP_INICIAL.md)** - Configure o servidor Kamatera (5 minutos)
- **[DEPLOY_SIMPLES.md](DEPLOY_SIMPLES.md)** - Comandos de deploy e atualização
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Guia completo do Docker
- **[DROPBOX_BUILD_FIX.md](DROPBOX_BUILD_FIX.md)** - Resolver problemas de build local

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
