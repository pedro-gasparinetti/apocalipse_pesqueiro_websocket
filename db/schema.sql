-- Schema para Apocalipse Pesqueiro
-- PostgreSQL Database Schema

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de jogos/partidas
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id VARCHAR(100) NOT NULL,
  mode VARCHAR(50) DEFAULT 'default',
  status VARCHAR(20) DEFAULT 'active',
  
  -- Configurações do jogo
  limite_sustentavel INT NOT NULL,
  limite_possivel_rodada INT NOT NULL,
  limite_rodadas INT NOT NULL,
  taxa_crescimento DECIMAL(5,4) NOT NULL,
  custo_fiscalizacao INT NOT NULL,
  quantidade_inicial_peixes_jogador INT NOT NULL,
  
  -- Estado inicial e final
  quantidade_peixes_lago_inicial DECIMAL(10,2) NOT NULL,
  quantidade_peixes_lago_final DECIMAL(10,2),
  quantidade_banca DECIMAL(10,2) DEFAULT 0,
  
  -- Metadados
  total_jogadores INT NOT NULL,
  total_rodadas_jogadas INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'finished', 'abandoned'))
);

-- Tabela de jogadores em cada partida
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  socket_id VARCHAR(100) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  player_photo TEXT,
  
  -- Resultados finais
  peixes_cesto_inicial DECIMAL(10,2) DEFAULT 0,
  peixes_cesto_final DECIMAL(10,2),
  position INT,
  
  -- Estatísticas agregadas
  total_pescado DECIMAL(10,2) DEFAULT 0,
  total_fiscalizado INT DEFAULT 0,
  total_fiscalizou INT DEFAULT 0,
  total_roubou INT DEFAULT 0,
  total_foi_pego INT DEFAULT 0,
  
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(game_id, socket_id)
);

-- Tabela de rodadas
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  
  -- Estado do lago
  quantidade_lago_inicial DECIMAL(10,2) NOT NULL,
  quantidade_lago_final DECIMAL(10,2),
  quantidade_nos_cestos DECIMAL(10,2) DEFAULT 0,
  crescimento_lago DECIMAL(10,2) DEFAULT 0,
  saldo_banca DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(game_id, round_number)
);

-- Tabela de jogadas/decisões dos jogadores
CREATE TABLE player_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  game_player_id UUID REFERENCES game_players(id) ON DELETE CASCADE,
  
  -- Intenção do jogador
  quantidade_pescada INT NOT NULL,
  jogador_fiscalizado_socket_id VARCHAR(100),
  
  -- Resultado da jogada
  quantidade_acumulada DECIMAL(10,2) DEFAULT 0,
  roubou BOOLEAN DEFAULT FALSE,
  foi_fiscalizado BOOLEAN DEFAULT FALSE,
  quantidade_fiscalizadores INT DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  rateio_ganho DECIMAL(10,2) DEFAULT 0,
  rateio_perdido DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fiscalizações (quem fiscalizou quem)
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id UUID REFERENCES player_decisions(id) ON DELETE CASCADE,
  auditor_game_player_id UUID REFERENCES game_players(id) ON DELETE CASCADE,
  auditor_name VARCHAR(100) NOT NULL,
  found_cheating BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_games_room_id ON games(room_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_rounds_game_id ON rounds(game_id, round_number);
CREATE INDEX idx_decisions_round_id ON player_decisions(round_id);
CREATE INDEX idx_audits_decision_id ON audits(decision_id);

-- View para resultados consolidados
CREATE VIEW game_results AS
SELECT 
  g.id as game_id,
  g.room_id,
  g.created_at,
  g.finished_at,
  g.total_jogadores,
  g.total_rodadas_jogadas,
  g.quantidade_banca,
  g.quantidade_peixes_lago_inicial,
  g.quantidade_peixes_lago_final,
  gp.socket_id,
  gp.player_name,
  gp.position,
  gp.peixes_cesto_final,
  gp.total_pescado,
  gp.total_fiscalizado,
  gp.total_fiscalizou,
  gp.total_roubou,
  gp.total_foi_pego
FROM games g
JOIN game_players gp ON g.id = gp.game_id
WHERE g.status = 'finished'
ORDER BY g.finished_at DESC, gp.position ASC;

-- View para análise de rodadas
CREATE VIEW round_analysis AS
SELECT 
  r.game_id,
  r.round_number,
  r.quantidade_lago_inicial,
  r.quantidade_lago_final,
  r.quantidade_nos_cestos,
  r.crescimento_lago,
  COUNT(pd.id) as total_decisoes,
  SUM(CASE WHEN pd.roubou THEN 1 ELSE 0 END) as total_roubos,
  SUM(CASE WHEN pd.foi_fiscalizado THEN 1 ELSE 0 END) as total_fiscalizacoes,
  AVG(pd.quantidade_pescada) as media_pescada,
  r.created_at
FROM rounds r
LEFT JOIN player_decisions pd ON r.id = pd.round_id
GROUP BY r.id, r.game_id, r.round_number, r.quantidade_lago_inicial, 
         r.quantidade_lago_final, r.quantidade_nos_cestos, r.crescimento_lago, r.created_at
ORDER BY r.game_id, r.round_number;
