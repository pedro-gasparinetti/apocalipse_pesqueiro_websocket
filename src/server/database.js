// Carrega variáveis de ambiente
require('dotenv').config();

const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apocalipse_pesqueiro',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners para debug
pool.on('connect', () => {
  console.log('[DATABASE] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DATABASE] Unexpected error on idle client', err.message);
  // Não chamar process.exit - apenas logar o erro
});

// Função helper para executar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DATABASE] Executed query', { 
      text: text.substring(0, 100), 
      duration, 
      rows: res.rowCount 
    });
    return res;
  } catch (error) {
    console.error('[DATABASE] Query error', { 
      text: text.substring(0, 100), 
      error: error.message 
    });
    throw error;
  }
}

// Testa a conexão com o banco
async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('[DATABASE] Connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('[DATABASE] Connection test failed:', error.message);
    console.error('[DATABASE] Make sure PostgreSQL is running and database exists');
    return false;
  }
}

module.exports = {
  query,
  pool,
  testConnection
};
