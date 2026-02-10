# 🐘 Guia Rápido: Instalar PostgreSQL no Windows

## ⏱️ Tempo estimado: 10 minutos

---

## 📥 PASSO 1: Download

1. **Baixe o instalador oficial:**
   - Link direto: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Escolha: **PostgreSQL 16.x** para Windows x86-64
   - Tamanho: ~300 MB

2. **Execute o arquivo baixado:**
   - `postgresql-16.x-windows-x64.exe`

---

## 🔧 PASSO 2: Instalação

### Tela 1: Bem-vindo
- Clique em **"Next"**

### Tela 2: Diretório de Instalação
- Deixe o padrão: `C:\Program Files\PostgreSQL\16`
- Clique em **"Next"**

### Tela 3: Componentes
- ✅ Deixe **TODOS marcados**:
  - PostgreSQL Server
  - pgAdmin 4
  - Stack Builder
  - Command Line Tools
- Clique em **"Next"**

### Tela 4: Diretório de Dados
- Deixe o padrão: `C:\Program Files\PostgreSQL\16\data`
- Clique em **"Next"**

### Tela 5: SENHA (IMPORTANTE!)
- Digite uma senha para o usuário **postgres**
- **Sugestões:** `postgres123` ou `admin123`
- ⚠️ **ANOTE ESTA SENHA!** Você vai precisar dela!
- Repita a senha
- Clique em **"Next"**

### Tela 6: Porta
- Deixe: **5432**
- Clique em **"Next"**

### Tela 7: Locale
- Deixe: **Default locale** ou escolha **Portuguese, Brazil**
- Clique em **"Next"**

### Tela 8: Resumo
- Revise as configurações
- Clique em **"Next"**

### Tela 9: Instalação
- Aguarde a instalação (2-5 minutos)
- Clique em **"Finish"**

---

## ✅ PASSO 3: Verificar Instalação

Abra um **novo terminal PowerShell** e execute:

```powershell
# Adicionar PostgreSQL ao PATH (temporariamente)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Testar
psql --version
```

Deve aparecer: `psql (PostgreSQL) 16.x`

---

## 🗄️ PASSO 4: Criar Banco de Dados

### Opção A: Via Script Automático (Fácil)

No terminal do projeto, execute:

```powershell
npm run db:setup
```

Quando pedir a senha, digite a senha que você configurou no Passo 2.

### Opção B: Via pgAdmin 4 (Visual)

1. **Abra o pgAdmin 4:**
   - Menu Iniciar → PostgreSQL 16 → pgAdmin 4

2. **Conecte ao servidor:**
   - Clique em "PostgreSQL 16" na lateral esquerda
   - Digite a senha que você configurou

3. **Crie o banco:**
   - Clique com botão direito em "Databases"
   - Create → Database
   - Nome: `apocalipse_pesqueiro`
   - Owner: postgres
   - Save

4. **Execute o schema:**
   - Clique com botão direito no banco `apocalipse_pesqueiro`
   - Query Tool
   - Abra o arquivo: `db/schema.sql` (do projeto)
   - Execute (F5)

### Opção C: Via Terminal (Manual)

```powershell
# Navegar para a pasta do PostgreSQL
cd "C:\Program Files\PostgreSQL\16\bin"

# Conectar ao PostgreSQL
.\psql.exe -U postgres

# Digite a senha quando solicitado

# Criar banco (dentro do psql)
CREATE DATABASE apocalipse_pesqueiro;

# Sair
\q

# Executar schema
.\psql.exe -U postgres -d apocalipse_pesqueiro -f "C:\Users\Pedro\Dropbox\Jogo Experimental\Apocalipse pesqueiro\apocalipse_pesqueiro_websocket\db\schema.sql"
```

---

## 🔐 PASSO 5: Configurar .env

Edite o arquivo `.env` na raiz do projeto:

```env
# Configuração do Servidor Socket.IO
SOCKET_PORT=3001

# Configuração do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI  ← COLOQUE A SENHA DO PASSO 2!
```

---

## 🚀 PASSO 6: Testar

No terminal do projeto:

```powershell
# Testar conexão com banco
npm run db:test

# Se deu certo, iniciar o jogo
npm run dev
```

Deve aparecer:

```
[SOCKET-SERVER] Ready on http://localhost:3001
[DATABASE] Connected to PostgreSQL
[DATABASE] Connection test successful
[SOCKET-SERVER] ✓ Database connection successful
[SOCKET-SERVER] Game results will be automatically saved
```

---

## 🐛 Problemas Comuns

### Erro: "psql não é reconhecido"

**Solução:** Adicione ao PATH permanentemente:

1. Menu Iniciar → "Variáveis de ambiente"
2. "Editar as variáveis de ambiente do sistema"
3. Botão "Variáveis de Ambiente"
4. Em "Variáveis do Sistema", selecione "Path" → Editar
5. Novo → Adicione: `C:\Program Files\PostgreSQL\16\bin`
6. OK → OK → OK
7. **Feche e reabra o terminal**

### Erro: "password authentication failed"

**Solução:** Verifique a senha no arquivo `.env`

### Erro: "database does not exist"

**Solução:** Execute:
```powershell
npm run db:setup
```

### PostgreSQL não inicia

**Solução:**

1. Menu Iniciar → "Serviços" (services.msc)
2. Procure: "postgresql-x64-16"
3. Clique com botão direito → Iniciar
4. Propriedades → Tipo de inicialização: Automático

---

## 📊 Próximos Passos

Após configurar:

1. ✅ Jogue algumas partidas
2. ✅ Resultados são salvos automaticamente
3. ✅ Consulte os dados:
   ```powershell
   npm run db:query
   ```

4. ✅ Ou via pgAdmin:
   - Abra pgAdmin 4
   - apocalipse_pesqueiro → Schemas → public → Tables
   - Clique com botão direito na tabela → View/Edit Data

---

## 🆘 Precisa de Ajuda?

- Documentação PostgreSQL: https://www.postgresql.org/docs/
- Tutorial pgAdmin: https://www.pgadmin.org/docs/
- Vídeo instalação: https://www.youtube.com/results?search_query=instalar+postgresql+windows

---

**Boa sorte! 🎮🐘**
