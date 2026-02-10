/**
 * Script de exemplo para consultar dados do banco
 * Execute: node db/query-examples.js
 */

require('dotenv').config();
const { query } = require('../src/server/database');
const { getRecentGames, getGameResults, exportGameData } = require('../src/server/game-repository');

async function runExamples() {
  console.log('📊 PostgreSQL - Exemplos de Consultas\n');
  
  try {
    // 1. Últimos jogos
    console.log('1️⃣  Últimos 5 jogos finalizados:');
    console.log('─'.repeat(50));
    const recentGames = await getRecentGames(5);
    
    if (recentGames.length === 0) {
      console.log('Nenhum jogo finalizado ainda. Jogue algumas partidas!\n');
      return;
    }
    
    recentGames.forEach((game, index) => {
      console.log(`\n${index + 1}. Game ID: ${game.id}`);
      console.log(`   Room: ${game.room_id}`);
      console.log(`   Jogadores: ${game.total_jogadores}`);
      console.log(`   Rodadas: ${game.total_rodadas_jogadas}`);
      console.log(`   Lago Final: ${parseFloat(game.quantidade_peixes_lago_final).toFixed(2)} peixes`);
      console.log(`   Banca: ${parseFloat(game.quantidade_banca).toFixed(2)} peixes`);
      console.log(`   Finalizado: ${new Date(game.finished_at).toLocaleString('pt-BR')}`);
    });
    
    console.log('\n' + '─'.repeat(50));
    
    // 2. Resultados detalhados do jogo mais recente
    const latestGame = recentGames[0];
    console.log(`\n2️⃣  Ranking do jogo mais recente:`);
    console.log('─'.repeat(50));
    
    const results = await getGameResults(latestGame.id);
    results.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${result.position}º - ${result.player_name}`);
      console.log(`   Peixes: ${parseFloat(result.peixes_cesto_final).toFixed(2)}`);
      console.log(`   Total pescado: ${parseFloat(result.total_pescado).toFixed(2)}`);
      console.log(`   Fiscalizou: ${result.total_fiscalizou}x | Foi fiscalizado: ${result.total_fiscalizado}x`);
      console.log(`   Roubou: ${result.total_roubou}x | Foi pego: ${result.total_foi_pego}x\n`);
    });
    
    console.log('─'.repeat(50));
    
    // 3. Estatísticas gerais
    console.log('\n3️⃣  Estatísticas Gerais:');
    console.log('─'.repeat(50));
    
    const stats = await query(`
      SELECT 
        COUNT(*) as total_jogos,
        COUNT(DISTINCT game_id) as jogos_unicos,
        COUNT(*) as total_participacoes,
        AVG(peixes_cesto_final) as media_peixes,
        MAX(peixes_cesto_final) as recorde_peixes,
        SUM(total_roubou) as total_roubos,
        SUM(total_foi_pego) as total_flagrados
      FROM game_players
    `);
    
    const s = stats.rows[0];
    console.log(`Total de jogos finalizados: ${s.total_jogos}`);
    console.log(`Média de peixes por jogador: ${parseFloat(s.media_peixes).toFixed(2)}`);
    console.log(`Recorde de peixes: ${parseFloat(s.recorde_peixes).toFixed(2)}`);
    console.log(`Total de tentativas de roubo: ${s.total_roubos}`);
    console.log(`Total de jogadores flagrados: ${s.total_flagrados}`);
    console.log(`Taxa de sucesso do roubo: ${((1 - s.total_flagrados / s.total_roubos) * 100).toFixed(1)}%`);
    
    console.log('\n' + '─'.repeat(50));
    
    // 4. Análise de sustentabilidade
    console.log('\n4️⃣  Análise de Sustentabilidade:');
    console.log('─'.repeat(50));
    
    const sustainability = await query(`
      SELECT 
        COUNT(*) as total_jogos,
        AVG(quantidade_peixes_lago_final) as media_lago_final,
        COUNT(CASE WHEN quantidade_peixes_lago_final < 10 THEN 1 END) as jogos_colapso,
        AVG(quantidade_banca) as media_banca
      FROM games
      WHERE status = 'finished'
    `);
    
    const sust = sustainability.rows[0];
    console.log(`Média do lago ao final: ${parseFloat(sust.media_lago_final).toFixed(2)} peixes`);
    console.log(`Jogos com colapso (< 10 peixes): ${sust.jogos_colapso} (${(sust.jogos_colapso / sust.total_jogos * 100).toFixed(1)}%)`);
    console.log(`Média da banca: ${parseFloat(sust.media_banca).toFixed(2)} peixes`);
    
    console.log('\n' + '─'.repeat(50));
    
    // 5. Top jogadores
    console.log('\n5️⃣  Top 5 Jogadores (por média de peixes):');
    console.log('─'.repeat(50));
    
    const topPlayers = await query(`
      SELECT 
        player_name,
        COUNT(*) as jogos,
        AVG(peixes_cesto_final) as media_peixes,
        SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as vitorias
      FROM game_players
      GROUP BY player_name
      HAVING COUNT(*) >= 1
      ORDER BY media_peixes DESC
      LIMIT 5
    `);
    
    topPlayers.rows.forEach((player, index) => {
      console.log(`${index + 1}. ${player.player_name}`);
      console.log(`   Média: ${parseFloat(player.media_peixes).toFixed(2)} peixes`);
      console.log(`   Jogos: ${player.jogos} | Vitórias: ${player.vitorias}\n`);
    });
    
    console.log('─'.repeat(50));
    console.log('\n✅ Consultas concluídas!\n');
    
  } catch (error) {
    console.error('❌ Erro ao consultar dados:', error.message);
  }
  
  process.exit(0);
}

// Execute
runExamples();
