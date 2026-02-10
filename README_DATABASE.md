# 🗄️ Integração com PostgreSQL - Branch banco_de_dados

Este branch adiciona **salvamento automático** de todos os resultados dos jogos em banco de dados PostgreSQL.

## 🎯 O que foi Implementado

### ✅ Funcionalidades

1. **Salvamento Automático**: Quando um jogo termina, todos os dados são salvos automaticamente
2. **Histórico Completo**: Salva não só o resultado final, mas todas as rodadas e decisões
3. **Estatísticas Agregadas**: Calcula automaticamente estatísticas de cada jogador
4. **Esquema Relacional**: Banco de dados normalizado com relacionamentos apropriados
5. **Consultas Prontas**: Views SQL para análises rápidas
6. **Error Handling**: Jogo continua funcionando mesmo se banco falhar

### 📊 Dados Salvos

**Por Jogo:**
- Configurações (limites, taxas, crescimento)
- Estado inicial e final do lago
- Quantidade na banca
- Total de jogadores e rodadas

**Por Jogador:**
- Nome e avatar (gerado automaticamente)
- Peixes no cesto (inicial e final)
- Posição no ranking
- Estatísticas: total pescado, fiscalizações realizadas/recebidas, roubos

**Por Rodada:**
- Estado do lago antes e depois
- Crescimento do lago
- Peixes pescados totais
- Saldo da banca

**Por Decisão:**
- Quantidade pescada
- Jogador fiscalizado (se houver)
- Se roubou e foi pego
- Multas e rateios

---

## 🚀 Setup Rápido

### 1. Instalar PostgreSQL

**Windows:** https://www.postgresql.org/download/windows/  
**macOS:** `brew install postgresql@14`  
**Linux:** `sudo apt install postgresql`

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### 3. Criar Banco e Tabelas

```bash
npm run db:setup
```

### 4. Testar Conexão

```bash
npm run db:test
```

### 5. Iniciar o Jogo

```bash
npm run dev
```

---

## 📁 Arquivos Criados

```
db/
├── schema.sql                 # Schema completo do banco
└── setup-database.js          # Script automático de setup

src/server/
├── database.js                # Configuração do PostgreSQL
└── game-repository.js         # Funções para salvar/consultar dados

DATABASE_SETUP.md              # Guia detalhado de setup
.env.example                   # Exemplo de variáveis de ambiente
```

---

## 🔍 Como Verificar os Dados

### Via psql (Terminal)

```bash
psql -U postgres -d apocalipse_pesqueiro
```

```sql
-- Ver últimos jogos
SELECT * FROM games ORDER BY finished_at DESC LIMIT 5;

-- Ver ranking de um jogo
SELECT * FROM game_results WHERE game_id = 'UUID';

-- Estatísticas gerais
SELECT COUNT(*) as total_jogos FROM games WHERE status = 'finished';
```

### Via pgAdmin 4

1. Abra pgAdmin 4
2. Conecte ao servidor PostgreSQL
3. Navegue até: Databases → apocalipse_pesqueiro → Schemas → Tables
4. Clique com botão direito na tabela → View/Edit Data

---

## 📊 Estrutura do Banco

```
┌─────────────┐
│   games     │ ← Dados principais do jogo
└──────┬──────┘
       │
       ├─→ ┌──────────────┐
       │   │ game_players │ ← Jogadores e rankings
       │   └──────┬───────┘
       │          │
       └─→ ┌─────┴────┐
           │  rounds  │ ← Rodadas
           └────┬─────┘
                │
                ├─→ ┌──────────────────┐
                │   │player_decisions  │ ← Decisões individuais
                │   └────┬─────────────┘
                │        │
                └────────┴─→ ┌────────┐
                            │ audits │ ← Fiscalizações
                            └────────┘
```

---

## 🎮 Exemplo de Uso

1. **Jogue algumas partidas** normalmente
2. **Ao finalizar**, o jogo salva automaticamente
3. **Console mostra** confirmação:
   ```
   [GAME-LOGIC] Game finished! Saving to database...
   [DB-REPO] Game saved with ID: 123e4567-e89b-12d3-a456-426614174000
   ```

4. **Consulte os dados** via psql ou pgAdmin

---

## 🔧 Comandos Úteis

```bash
# Setup do banco (primeira vez)
npm run db:setup

# Testar conexão
npm run db:test

# Iniciar servidor
npm run backend

# Iniciar frontend
npm run frontend

# Ambos juntos
npm run dev
```

---

## 🐛 Troubleshooting

**Erro: "password authentication failed"**
- Verifique senha no `.env`

**Erro: "database does not exist"**
```bash
npm run db:setup
```

**PostgreSQL não conecta**
- Verifique se o serviço está rodando
- Windows: `services.msc` → postgresql
- macOS/Linux: `brew services start postgresql` ou `sudo systemctl start postgresql`

**Ver logs detalhados**
- O servidor mostra logs de todas operações:
  ```
  [DATABASE] Connected to PostgreSQL
  [DB-REPO] Starting to save game data...
  [DB-REPO] Game saved with ID: ...
  ```

---

## 📚 Documentação Completa

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Guia detalhado de configuração
- **[db/schema.sql](db/schema.sql)** - Schema completo com comentários
- **[src/server/game-repository.js](src/server/game-repository.js)** - API de consultas

---

## 🎯 Próximos Passos Possíveis

- [ ] API REST para consultar dados via HTTP
- [ ] Dashboard web para visualizar estatísticas
- [ ] Exportação para CSV/Excel
- [ ] Sistema de autenticação de jogadores
- [ ] Integração com modalidades de buy-in (US$ 1, US$ 1000)
- [ ] Migração para Supabase (PostgreSQL em cloud)

---

## ✨ Diferenças do Branch Main

Este branch adiciona:
- ✅ Salvamento automático no PostgreSQL
- ✅ Histórico completo de partidas
- ✅ Estatísticas agregadas
- ✅ Sistema de consultas
- ✅ Scripts de setup automatizado

O jogo funciona **exatamente igual**, apenas com persistência de dados adicional!
