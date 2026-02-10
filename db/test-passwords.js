const { Client } = require('pg');

const senhasComuns = [
  'postgres',
  'admin',
  'password',
  '123456',
  'postgres123',
  'admin123',
  'root',
  '12345678',
  ''
];

async function testarSenhas() {
  console.log('🔍 Testando senhas comuns...\n');
  
  for (const senha of senhasComuns) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: senha,
      database: 'postgres',
      connectionTimeoutMillis: 2000
    });
    
    try {
      await client.connect();
      await client.query('SELECT NOW()');
      await client.end();
      
      console.log(`\n✅ SENHA ENCONTRADA: "${senha}"`);
      console.log('\nAtualize seu arquivo .env com:');
      console.log(`DB_PASSWORD=${senha}\n`);
      process.exit(0);
      
    } catch (error) {
      console.log(`❌ "${senha}" - incorreta`);
      try {
        await client.end();
      } catch {}
    }
  }
  
  console.log('\n⚠️  Nenhuma senha comum funcionou.');
  console.log('\nOpções:');
  console.log('1. Tente lembrar a senha que você definiu na instalação');
  console.log('2. Use o pgAdmin 4 para resetar a senha');
  console.log('3. Reinstale o PostgreSQL\n');
}

testarSenhas();
