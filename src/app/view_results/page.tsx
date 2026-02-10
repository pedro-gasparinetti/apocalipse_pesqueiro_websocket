'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GamesList } from './components/GamesList';
import { GameDetails } from './components/GameDetails';

export default function ViewResultsPage() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/games?limit=50');
      const result = await response.json();
      
      if (result.success) {
        setGames(result.data);
      } else {
        setError(result.error || 'Failed to load games');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📊 Resultados dos Jogos
              </h1>
              <p className="text-gray-600">
                Visualize e analise os dados históricos do Apocalipse Pesqueiro
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Voltar ao Jogo
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-500 text-sm mb-1">Total de Jogos</div>
              <div className="text-3xl font-bold text-blue-600">{games.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-500 text-sm mb-1">Total de Jogadores</div>
              <div className="text-3xl font-bold text-green-600">
                {games.reduce((sum, g) => sum + (g.total_jogadores || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-500 text-sm mb-1">Média Jogadores/Jogo</div>
              <div className="text-3xl font-bold text-purple-600">
                {(games.reduce((sum, g) => sum + (g.total_jogadores || 0), 0) / games.length).toFixed(1)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-500 text-sm mb-1">Lagos Esgotados</div>
              <div className="text-3xl font-bold text-red-600">
                {games.filter(g => g.quantidade_peixes_lago_final === 0).length}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando jogos do banco de dados...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-bold mb-2">⚠️ Erro ao carregar dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchGames}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhum jogo encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Jogue algumas partidas para começar a ver dados aqui!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Jogar Agora
            </Link>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Games List */}
            <div className="lg:col-span-1">
              <GamesList
                games={games}
                selectedGameId={selectedGameId}
                onSelectGame={setSelectedGameId}
              />
            </div>

            {/* Game Details */}
            <div className="lg:col-span-2">
              {selectedGameId ? (
                <GameDetails gameId={selectedGameId} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Selecione um jogo
                  </h3>
                  <p className="text-gray-600">
                    Clique em um jogo da lista para ver os detalhes completos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
