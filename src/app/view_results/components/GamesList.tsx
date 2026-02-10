interface GamesListProps {
  games: any[];
  selectedGameId: number | null;
  onSelectGame: (id: number) => void;
}

export function GamesList({ games, selectedGameId, onSelectGame }: GamesListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
        <h2 className="text-xl font-bold">Jogos Recentes</h2>
        <p className="text-sm text-blue-100">{games.length} jogos registrados</p>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {games.map((game) => {
          const isSelected = selectedGameId === game.id;
          const lagoEsgotado = game.quantidade_peixes_lago_final === 0;
          const date = new Date(game.finished_at);
          
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`w-full text-left p-4 border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                isSelected ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {lagoEsgotado ? '💀' : '🐟'}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Jogo #{game.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Room: {game.room_id}
                    </div>
                  </div>
                </div>
                {lagoEsgotado && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    ESGOTADO
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                <div>👥 {game.total_jogadores} jogadores</div>
                <div>🔄 {game.total_rodadas_jogadas} rodadas</div>
                <div>🐟 {game.quantidade_peixes_lago_final} peixes</div>
                <div>💰 R$ {game.quantidade_banca}</div>
              </div>
              
              <div className="text-xs text-gray-400">
                {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
