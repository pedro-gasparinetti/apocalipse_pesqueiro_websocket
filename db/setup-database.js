/**
 * Script helper para criar o banco de dados PostgreSQL
 * Execute: node db/setup-database.js
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🗄️  PostgreSQL Database Setup\n');
  
  // Conecta ao PostgreSQL sem especificar database (conecta ao postgres default)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Conecta ao banco padrão primeiro
  });

  try {
    console.log('1. Connecting to PostgreSQL...');
    await client.connect();
    console.log('   ✓ Connected\n');

    const dbName = process.env.DB_NAME || 'apocalipse_pesqueiro';

    // Verifica se o banco já existe
    console.log(`2. Checking if database '${dbName}' exists...`);
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`   Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`   ✓ Database '${dbName}' created\n`);
    } else {
      console.log(`   ✓ Database '${dbName}' already exists\n`);
    }

    await client.end();

    // Agora conecta ao banco criado para executar o schema
    console.log('3. Connecting to application database...');
    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName
    });

    await appClient.connect();
    console.log('   ✓ Connected\n');

    // Lê e executa o schema SQL
    console.log('4. Creating tables from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await appClient.query(schemaSql);
    console.log('   ✓ Tables created successfully\n');

    // Verifica as tabelas criadas
    console.log('5. Verifying tables...');
    const tables = await appClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('   Tables created:');
    tables.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    await appClient.end();

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nYou can now start the server with: npm run dev');
    console.log('Game results will be automatically saved to PostgreSQL.\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file has correct credentials');
    console.error('3. Verify the postgres user has permission to create databases');
    console.error('\nSee DATABASE_SETUP.md for detailed instructions.\n');
    process.exit(1);
  }
}

// Execute
setupDatabase();
