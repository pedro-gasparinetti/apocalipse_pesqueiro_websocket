const { pool, query } = require('./database');

/**
 * Repository para salvar dados completos do jogo no PostgreSQL
 */

/**
 * Salva um jogo completo com todas as rodadas e decisões
 * @param {Object} gameData - Dados completos do jogo
 * @param {Object} room - Room object do servidor
 * @returns {Promise<string>} - ID do jogo salvo
 */
async function saveGameComplete(gameData, room) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('[DB-REPO] Starting to save game data...');
    
    // 1. Salvar dados principais do jogo
    const gameResult = await client.query(`
      INSERT INTO games (
        room_id, mode, status,
        limite_sustentavel, limite_possivel_rodada, limite_rodadas,
        taxa_crescimento, custo_fiscalizacao, quantidade_inicial_peixes_jogador,
        quantidade_peixes_lago_inicial, quantidade_peixes_lago_final,
        quantidade_banca, total_jogadores, total_rodadas_jogadas,
        finished_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING id
    `, [
      room.id,
      'default',
      'finished',
      gameData.limiteSustentavel,
      gameData.limitePossivelRodada,
      gameData.limiteRodadas,
      gameData.taxaCrescimento,
      gameData.custoFiscalizacao,
      gameData.quantidadeInicialPeixesJogador,
      room.players.size * gameData.quantidadeInicialPeixesJogador,
      gameData.quantidadePeixesLago,
      gameData.quantidadeBanca,
      room.players.size,
      gameData.rodadas.length
    ]);
    
    const gameId = gameResult.rows[0].id;
    console.log('[DB-REPO] Game saved with ID:', gameId);
    
    // 2. Salvar jogadores e calcular estatísticas
    const playerStats = calculatePlayerStats(gameData, room);
    const gamePlayerIds = new Map();
    
    for (const [socketId, player] of room.players) {
      const stats = playerStats.get(socketId);
      
      const playerResult = await client.query(`
        INSERT INTO game_players (
          game_id, socket_id, player_name, player_photo,
          peixes_cesto_inicial, peixes_cesto_final, position,
          total_pescado, total_fiscalizado, total_fiscalizou,
          total_roubou, total_foi_pego
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        gameId,
        socketId,
        player.name,
        player.photo,
        0,
        player.state['PEIXES_CESTO'] || 0,
        stats.position,
        stats.totalPescado,
        stats.totalFiscalizado,
        stats.totalFiscalizou,
        stats.totalRoubou,
        stats.totalFoiPego
      ]);
      
      gamePlayerIds.set(socketId, playerResult.rows[0].id);
    }
    
    console.log('[DB-REPO] Saved', gamePlayerIds.size, 'players');
    
    // 3. Salvar rodadas e decisões
    for (const rodada of gameData.rodadas) {
      // Salvar rodada
      const roundResult = await client.query(`
        INSERT INTO rounds (
          game_id, round_number,
          quantidade_lago_inicial, quantidade_lago_final,
          quantidade_nos_cestos, crescimento_lago, saldo_banca
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        gameId,
        rodada.numero,
        rodada.quantidadeLagoInicial,
        rodada.quantidadeLagoFinal,
        rodada.quantidadeNosCestos,
        rodada.crescimentoLago,
        rodada.saldoBanca
      ]);
      
      const roundId = roundResult.rows[0].id;
      
      // Salvar decisões de cada jogador nesta rodada
      for (const jogada of rodada.jogadas) {
        const gamePlayerId = gamePlayerIds.get(jogada.idJogador);
        
        if (!gamePlayerId) {
          console.warn('[DB-REPO] Player not found for decision:', jogada.idJogador);
          continue;
        }
        
        const decisionResult = await client.query(`
          INSERT INTO player_decisions (
            round_id, game_player_id,
            quantidade_pescada, jogador_fiscalizado_socket_id,
            quantidade_acumulada, roubou, foi_fiscalizado,
            quantidade_fiscalizadores, multa, rateio_ganho, rateio_perdido
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          roundId,
          gamePlayerId,
          jogada.quantidadePescada,
          jogada.jogadorAFiscalizar,
          jogada.quantidadeAcumulada,
          jogada.roubou,
          jogada.fiscalizadoPor && jogada.fiscalizadoPor.length > 0,
          jogada.fiscalizadoPor ? jogada.fiscalizadoPor.length : 0,
          jogada.multa || 0,
          jogada.rateioGanhado || 0,
          jogada.rateioPerdido || 0
        ]);
        
        const decisionId = decisionResult.rows[0].id;
        
        // Salvar fiscalizadores
        if (jogada.fiscalizadoPor && jogada.fiscalizadoPor.length > 0) {
          for (const fiscalizador of jogada.fiscalizadoPor) {
            // Encontrar o socket_id do fiscalizador pelo nome
            const fiscalizadorPlayer = Array.from(room.players.values())
              .find(p => p.name === fiscalizador.name);
            
            if (fiscalizadorPlayer) {
              const auditorGamePlayerId = gamePlayerIds.get(fiscalizadorPlayer.id);
              
              await client.query(`
                INSERT INTO audits (
                  decision_id, auditor_game_player_id, auditor_name, found_cheating
                ) VALUES ($1, $2, $3, $4)
              `, [
                decisionId,
                auditorGamePlayerId,
                fiscalizador.name,
                jogada.roubou
              ]);
            }
          }
        }
      }
    }
    
    console.log('[DB-REPO] Saved', gameData.rodadas.length, 'rounds with all decisions');
    
    await client.query('COMMIT');
    console.log('[DB-REPO] Transaction committed successfully. Game ID:', gameId);
    
    return gameId;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB-REPO] Error saving game, rolled back transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Calcula estatísticas agregadas de cada jogador
 */
function calculatePlayerStats(gameData, room) {
  const stats = new Map();
  
  // Inicializa stats para cada jogador
  for (const [socketId, player] of room.players) {
    stats.set(socketId, {
      totalPescado: 0,
      totalFiscalizado: 0,
      totalFiscalizou: 0,
      totalRoubou: 0,
      totalFoiPego: 0,
      peixesCestoFinal: player.state['PEIXES_CESTO'] || 0,
      position: 0
    });
  }
  
  // Agrega dados de todas as rodadas
  for (const rodada of gameData.rodadas) {
    for (const jogada of rodada.jogadas) {
      const playerStats = stats.get(jogada.idJogador);
      if (!playerStats) continue;
      
      playerStats.totalPescado += jogada.quantidadePescada || 0;
      
      if (jogada.jogadorAFiscalizar) {
        playerStats.totalFiscalizou++;
      }
      
      if (jogada.roubou) {
        playerStats.totalRoubou++;
      }
      
      if (jogada.fiscalizadoPor && jogada.fiscalizadoPor.length > 0) {
        playerStats.totalFiscalizado++;
        
        if (jogada.roubou) {
          playerStats.totalFoiPego++;
        }
      }
    }
  }
  
  // Calcula posições (ranking)
  const sortedPlayers = Array.from(stats.entries())
    .sort((a, b) => b[1].peixesCestoFinal - a[1].peixesCestoFinal);
  
  sortedPlayers.forEach(([socketId, playerStats], index) => {
    playerStats.position = index + 1;
  });
  
  return stats;
}

/**
 * Busca resultados de um jogo específico
 */
async function getGameResults(gameId) {
  const result = await query(`
    SELECT * FROM game_results
    WHERE game_id = $1
    ORDER BY position ASC
  `, [gameId]);
  
  return result.rows;
}

/**
 * Busca últimos N jogos
 */
async function getRecentGames(limit = 10) {
  const result = await query(`
    SELECT 
      id, room_id, total_jogadores, total_rodadas_jogadas,
      quantidade_banca, quantidade_peixes_lago_final,
      created_at, finished_at
    FROM games
    WHERE status = 'finished'
    ORDER BY finished_at DESC
    LIMIT $1
  `, [limit]);
  
  return result.rows;
}

/**
 * Exporta dados de um jogo em formato JSON
 */
async function exportGameData(gameId) {
  const client = await pool.connect();
  
  try {
    // Buscar dados do jogo
    const game = await client.query('SELECT * FROM games WHERE id = $1', [gameId]);
    const players = await client.query('SELECT * FROM game_players WHERE game_id = $1', [gameId]);
    const rounds = await client.query(`
      SELECT r.*, 
        json_agg(
          json_build_object(
            'decision', pd.*,
            'audits', (
              SELECT json_agg(a.*) 
              FROM audits a 
              WHERE a.decision_id = pd.id
            )
          )
        ) as decisions
      FROM rounds r
      LEFT JOIN player_decisions pd ON r.id = pd.round_id
      WHERE r.game_id = $1
      GROUP BY r.id
      ORDER BY r.round_number
    `, [gameId]);
    
    return {
      game: game.rows[0],
      players: players.rows,
      rounds: rounds.rows
    };
    
  } finally {
    client.release();
  }
}

module.exports = {
  saveGameComplete,
  getGameResults,
  getRecentGames,
  exportGameData
};
