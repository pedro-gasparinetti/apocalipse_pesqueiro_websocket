// Importação condicional do repositório (pode não estar disponível sem DB)
let saveGameComplete = null;
try {
  const repo = require('./game-repository');
  saveGameComplete = repo.saveGameComplete;
} catch (error) {
  console.log('[GAME-LOGIC] Database module not available, games will not be saved');
}

// Helper function for fish distribution
const distribuirPeixesProporcional = (jogadas, totalPeixesDisponiveis) => {
  const resultado = {};
  let peixesRestantes = totalPeixesDisponiveis;

  // Calcula a quantidade base de peixes que cada jogador pode pescar
  const quantidadeBase = Math.floor(totalPeixesDisponiveis / jogadas.length);

  // verifica quais jogadores estão dentro e fora do limite
  const jogadoresDentreLimite = jogadas.filter(
    (j) => j.quantidadePescada <= quantidadeBase
  );
  const jogadoresAcimaLimite = jogadas.filter(
    (j) => j.quantidadePescada > quantidadeBase
  );

  // distribui peixes para jogadores dentro do limite
  jogadoresDentreLimite.forEach((jogada) => {
    const pescou = Math.min(jogada.quantidadePescada, peixesRestantes);
    resultado[jogada.idJogador] = pescou;
    peixesRestantes -= pescou;
  });

  // distribui peixes para jogadores acima do limite
  if (jogadoresAcimaLimite.length > 0) {
    const peixesPorJogador = peixesRestantes / jogadoresAcimaLimite.length;
    jogadoresAcimaLimite.forEach((jogada) => {
      resultado[jogada.idJogador] = peixesPorJogador;
    });
  }

  return resultado;
};

// Core round processing logic
function processRound(room, io) {
  console.log('[GAME-LOGIC] Host authorized processing round');
            
  // Gather all players and their pending moves
  const roomPlayers = Array.from(room.players.values());
  const jogadasPendentes = roomPlayers.map(p => ({
    player: p,
    state: p.state['JOGADA_PENDENTE']
  })).filter(j => j.state != null);

  // Verify all players have played
  if (jogadasPendentes.length === roomPlayers.length) {
    console.log('[GAME-LOGIC] All players played. Calculating results...');
    
    // Access the actual game state object.
    // Because the client uses useMultiplayerState('gameState', ...), the data is nested under the 'gameState' key.
    const gameState = room.gameState['gameState'] || room.gameState;
    
    if (!gameState || !gameState.rodadas) {
      console.error('[GAME-LOGIC] Invalid game state structure:', JSON.stringify(room.gameState));
      return;
    }

    const rodadaAtual = {
      numero: gameState.rodadas.length + 1,
      quantidadeLagoInicial: gameState.quantidadePeixesLago,
      jogadas: [],
      crescimentoLago: gameState.quantidadePeixesLago * gameState.taxaCrescimento,
      quantidadeNosCestos: 0,
      quantidadeLagoFinal: 0,
      saldoBanca: 0
    };

    // Identify who is being audited (fiscalizado)
    const jogadoresFiscalizados = jogadasPendentes.reduce((acc, jogada) => {
      const alvoId = jogada.state.jogadorAFiscalizar;
      if (alvoId) {
        acc[alvoId] = acc[alvoId] || [];
        acc[alvoId].push(jogada.player);
      }
      return acc;
    }, {});

    // Calculate proportional fish limits
    const jogadasParaDistribuicao = jogadasPendentes.map((jogada) => ({
      idJogador: jogada.player.id,
      quantidadePescada: jogada.state.quantidadePescada
    }));
    
    const limitePeixesPossiveis = distribuirPeixesProporcional(
      jogadasParaDistribuicao,
      rodadaAtual.quantidadeLagoInicial
    );

    let somaPeixesNosCestos = 0;
    let somaBancaNaRodada = 0;

    // Process each player's move
    jogadasPendentes.forEach((jogadaPendente) => {
      const jogada = {
        idJogador: jogadaPendente.player.id,
        quantidadePescada: jogadaPendente.state.quantidadePescada,
        jogadorAFiscalizar: jogadaPendente.state.jogadorAFiscalizar,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0
      };

      const peixesCesto = jogadaPendente.player.state['PEIXES_CESTO'] || 0;
      let peixesPescadosJogador = limitePeixesPossiveis[jogadaPendente.player.id];

      // Cost of auditing
      peixesPescadosJogador -= jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;

      // Check for overfishing + auditing
      jogada.roubou = peixesPescadosJogador > gameState.limiteSustentavel;
      
      const fiscalizadores = jogadoresFiscalizados[jogadaPendente.player.id] || [];
      jogada.fiscalizadoPor = fiscalizadores.map(f => ({ name: f.name, photo: f.photo }));

      let resultadoJogadaJogador = {};

      if (jogada.roubou && fiscalizadores.length > 0) {
        console.log(`[GAME-LOGIC] Player ${jogadaPendente.player.name} caught overfishing!`);
        jogada.multa = 0.1 * peixesPescadosJogador;
        jogada.rateioPerdido = 0.9 * peixesPescadosJogador / fiscalizadores.length;

        resultadoJogadaJogador = {
          fiscalizadores: jogada.fiscalizadoPor,
          crescimentoLago: rodadaAtual.crescimentoLago,
          roubou: true,
          rateioGanhado: 0,
          peixesPescadosJogador: peixesPescadosJogador
        };

        // Distribute fines to auditors
        fiscalizadores.forEach((fiscalizador) => {
          const fCesto = fiscalizador.state['PEIXES_CESTO'] || 0;
          fiscalizador.state['PEIXES_CESTO'] = fCesto + jogada.rateioPerdido;
          
          const resAuditor = fiscalizador.state['RESULTADO_JOGADA'] || {};
          resAuditor.rateioGanhado = (resAuditor.rateioGanhado || 0) + jogada.rateioPerdido;
          fiscalizador.state['RESULTADO_JOGADA'] = resAuditor;
          
          somaPeixesNosCestos += jogada.rateioPerdido;
        });

        gameState.quantidadeBanca += jogada.multa;
        somaBancaNaRodada += jogada.multa;

      } else {
        // Safe catch
        jogada.quantidadeAcumulada = peixesCesto + peixesPescadosJogador;
        jogadaPendente.player.state['PEIXES_CESTO'] = jogada.quantidadeAcumulada;

        resultadoJogadaJogador = {
          fiscalizadores: jogada.fiscalizadoPor,
          peixesPescadosJogador: peixesPescadosJogador,
          crescimentoLago: rodadaAtual.crescimentoLago,
          rateioGanhado: (jogadaPendente.player.state['RESULTADO_JOGADA']?.rateioGanhado || 0)
        };

        gameState.quantidadeBanca += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;
        somaBancaNaRodada += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;
        somaPeixesNosCestos += peixesPescadosJogador;
      }

      // Finalize result state for this player
      jogadaPendente.player.state['RESULTADO_JOGADA'] = resultadoJogadaJogador;
      
      // Clear pending move
      jogadaPendente.player.state['JOGADA_PENDENTE'] = null;

      rodadaAtual.jogadas.push(jogada);
    });

    // Finalize round stats
    rodadaAtual.quantidadeNosCestos = somaPeixesNosCestos;
    rodadaAtual.quantidadeLagoFinal = gameState.quantidadePeixesLago
      - somaPeixesNosCestos
      - somaBancaNaRodada
      + rodadaAtual.crescimentoLago;
    
    rodadaAtual.saldoBanca = somaBancaNaRodada;
    gameState.quantidadePeixesLago = rodadaAtual.quantidadeLagoFinal;
    gameState.rodadas.push(rodadaAtual);
    gameState.jogoFinalizado = (rodadaAtual.numero == gameState.limiteRodadas) || rodadaAtual.quantidadeLagoFinal < 1;

    // BROADCAST EVERYTHING
    console.log('[GAME-LOGIC] Round processed. Broadcasting updates.');
    
    // Ensure the structure is correct for the client (wrapped in the key 'gameState')
    // We extracted 'gameState' (inner) earlier, now we wrap it back for the update payload.
    const updatePayload = {
      gameState: gameState
    };
    
    // Update server storage
    room.gameState = updatePayload;
    
    // 1. Broadcast Game State
    io.to(room.id).emit('game-state-updated', updatePayload);

    // 2. Broadcast Player States
    roomPlayers.forEach(p => {
      io.to(room.id).emit('player-state-updated', {
        playerId: p.id,
        state: p.state
      });
    });

    // 3. Save game to database if finished
    if (gameState.jogoFinalizado) {
      console.log('[GAME-LOGIC] Game finished!');
      
      if (saveGameComplete) {
        console.log('[GAME-LOGIC] Saving to database...');
        
        saveGameComplete(gameState, room)
          .then(gameId => {
            console.log('[GAME-LOGIC] Game successfully saved to database with ID:', gameId);
            
            // Opcional: notificar clientes que o jogo foi salvo
            io.to(room.id).emit('game-saved', {
              success: true,
              gameId: gameId,
              message: 'Jogo salvo com sucesso no banco de dados!'
            });
          })
          .catch(error => {
            console.error('[GAME-LOGIC] Failed to save game to database:', error);
            
            // Notificar clientes do erro
            io.to(room.id).emit('game-saved', {
              success: false,
              error: error.message,
              message: 'Erro ao salvar jogo no banco de dados'
            });
          });
      } else {
        console.log('[GAME-LOGIC] Database not configured. Game results not saved.');
      }
    }

  } else {
    console.log('[GAME-LOGIC] Cannot process round. Waiting for moves:', roomPlayers.length - jogadasPendentes.length);
  }
}

module.exports = {
  distribuirPeixesProporcional,
  processRound
};
