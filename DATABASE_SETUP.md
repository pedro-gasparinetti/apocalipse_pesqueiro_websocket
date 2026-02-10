# 🗄️ Configuração do Banco de Dados PostgreSQL

Este guia mostra como configurar o PostgreSQL localmente para salvar os resultados dos jogos.

---

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL

**Windows:**
- Baixe o instalador: https://www.postgresql.org/download/windows/
- Execute o instalador (PostgreSQL 14 ou superior)
- Durante instalação, defina uma senha para o usuário `postgres`
- Anote a senha escolhida!

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 🔧 Setup Inicial

### 1. Criar o arquivo `.env`

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI
```

### 2. Criar o Banco de Dados

**Opção A - Via linha de comando:**

```bash
# Windows (PowerShell)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Dentro do psql:
```sql
CREATE DATABASE apocalipse_pesqueiro;
\q
```

**Opção B - Via pgAdmin:**
1. Abra o pgAdmin 4
2. Conecte ao servidor PostgreSQL
3. Clique com botão direito em "Databases"
4. Selecione "Create" → "Database"
5. Nome: `apocalipse_pesqueiro`
6. Save

### 3. Criar as Tabelas

Execute o schema SQL:

```bash
# Windows (PowerShell)
psql -U postgres -d apocalipse_pesqueiro -f db/schema.sql

# macOS/Linux
sudo -u postgres psql -d apocalipse_pesqueiro -f db/schema.sql
```

**Ou via pgAdmin:**
1. Conecte ao banco `apocalipse_pesqueiro`
2. Clique em "Query Tool"
3. Abra o arquivo `db/schema.sql`
4. Execute (F5)

---

## ✅ Testar a Conexão

Inicie o servidor:
```bash
npm run backend
```

Você deve ver:
```
[SOCKET-SERVER] Ready on http://localhost:3001
[SOCKET-SERVER] Testing database connection...
[DATABASE] Connected to PostgreSQL
[DATABASE] Connection test successful: 2026-02-10T...
[SOCKET-SERVER] ✓ Database connection successful
[SOCKET-SERVER] Game results will be automatically saved
```

Se vir erro:
```
[SOCKET-SERVER] ✗ Database connection failed
```

Verifique:
- PostgreSQL está rodando?
- Credenciais no `.env` estão corretas?
- Banco de dados `apocalipse_pesqueiro` foi criado?

---

## 🎮 Como Funciona

### Salvamento Automático

Quando um jogo termina (10 rodadas ou lago vazio):
1. O servidor detecta `jogoFinalizado = true`
2. Salva automaticamente:
   - Dados do jogo (configurações, resultado final)
   - Todos os jogadores (posição, peixes no cesto, estatísticas)
   - Todas as rodadas (estado do lago, crescimento)
   - Todas as decisões (quem pescou quanto, quem fiscalizou quem)
   - Todas as fiscalizações (quem pegou quem roubando)

3. Clientes recebem notificação:
```javascript
socket.on('game-saved', (data) => {
  if (data.success) {
    console.log('Jogo salvo! ID:', data.gameId);
  }
});
```

### O que é Salvo

```
games
├── Configurações (limites, taxas, crescimento)
├── Estado inicial e final do lago
└── Quantidade na banca

game_players
├── Nome e foto (anônimo gerado)
├── Peixes no cesto (inicial e final)
├── Posição no ranking
└── Estatísticas agregadas
    ├── Total pescado
    ├── Vezes que fiscalizou
    ├── Vezes que foi fiscalizado
    ├── Vezes que roubou
    └── Vezes que foi pego

rounds
├── Número da rodada
├── Estado do lago (inicial e final)
├── Peixes pescados total
├── Crescimento do lago
└── Saldo da banca

player_decisions
├── Quantidade pescada (intenção)
├── Jogador fiscalizado
├── Resultado (roubou? foi pego?)
├── Multas e rateios
└── Quantidade acumulada

audits
├── Quem fiscalizou
├── Encontrou trapaça?
└── Nome do fiscalizador
```

---

## 📊 Consultar Dados Salvos

### Via psql

```bash
psql -U postgres -d apocalipse_pesqueiro
```

```sql
-- Ver últimos 5 jogos
SELECT * FROM games ORDER BY finished_at DESC LIMIT 5;

-- Ver resultados de um jogo específico
SELECT * FROM game_results WHERE game_id = 'UUID_DO_JOGO';

-- Análise de rodadas
SELECT * FROM round_analysis WHERE game_id = 'UUID_DO_JOGO';

-- Estatísticas gerais
SELECT 
  COUNT(*) as total_jogos,
  AVG(total_jogadores) as media_jogadores,
  AVG(quantidade_banca) as media_banca
FROM games 
WHERE status = 'finished';
```

### Via pgAdmin

1. Conecte ao banco `apocalipse_pesqueiro`
2. Navigate: Databases → apocalipse_pesqueiro → Schemas → public → Tables
3. Clique com botão direito na tabela → View/Edit Data → All Rows

---

## 🔍 Troubleshooting

### Erro: "password authentication failed"
- Verifique a senha no arquivo `.env`
- Resete a senha do usuário postgres:
  ```sql
  ALTER USER postgres PASSWORD 'nova_senha';
  ```

### Erro: "database does not exist"
```bash
psql -U postgres
CREATE DATABASE apocalipse_pesqueiro;
\q
```

### Erro: "relation does not exist"
- Execute o schema SQL novamente:
  ```bash
  psql -U postgres -d apocalipse_pesqueiro -f db/schema.sql
  ```

### PostgreSQL não inicia (Windows)
- Verifique o serviço Windows:
  - Win + R → `services.msc`
  - Procure "postgresql-x64-14"
  - Clique com botão direito → Iniciar

### Porta 5432 já em uso
- Mude a porta no `.env`:
  ```env
  DB_PORT=5433
  ```

---

## 📤 Exportar Dados

Os dados podem ser exportados para análise:

```javascript
// No código do servidor ou via script
const { exportGameData } = require('./src/server/game-repository');

const data = await exportGameData('UUID_DO_JOGO');
console.log(JSON.stringify(data, null, 2));
```

Ou via psql:
```bash
# Exportar para CSV
psql -U postgres -d apocalipse_pesqueiro -c "\COPY game_results TO 'resultados.csv' CSV HEADER"

# Exportar para JSON
psql -U postgres -d apocalipse_pesqueiro -t -c "SELECT json_agg(g) FROM games g WHERE status='finished'" > jogos.json
```

---

## 🎯 Próximos Passos

1. ✅ Banco configurado e rodando
2. 🎮 Jogue algumas partidas para testar
3. 📊 Consulte os dados salvos
4. 📈 Crie análises e visualizações dos dados
5. 🌐 (Futuro) Migre para banco em cloud (Supabase, Neon)

---

## 📚 Recursos Úteis

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [pgAdmin 4](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/) - Cliente SQL alternativo
- [Supabase](https://supabase.com) - PostgreSQL gerenciado gratuito
