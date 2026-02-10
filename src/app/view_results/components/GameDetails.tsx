'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface GameDetailsProps {
  gameId: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function GameDetails({ gameId }: GameDetailsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGameDetails();
  }, [gameId]);

  async function fetchGameDetails() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/games/${gameId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load game details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando detalhes do jogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-bold mb-2">⚠️ Erro</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { game, players, rounds, results } = data;
  
  // Prepare data for lake evolution chart
  const lakeData = rounds.map((round: any) => ({
    rodada: round.round_number,
    peixes: round.peixes_lago_pos_crescimento,
    pescado: round.total_pescado_rodada,
    capacidade: game.limite_sustentavel
  }));

  // Prepare data for player ranking
  const rankingData = results
    .sort((a: any, b: any) => a.position - b.position)
    .map((player: any) => ({
      name: `Jogador ${player.position}`,
      peixes: player.peixes_cesto_final,
      pescado: player.total_pescado,
      roubou: player.total_roubou,
      multado: player.total_foi_pego
    }));

  // Prepare data for behavior pie chart
  const behaviorData = [
    { name: 'Fiscalizações', value: results.reduce((sum: number, p: any) => sum + p.total_fiscalizou, 0) },
    { name: 'Roubos', value: results.reduce((sum: number, p: any) => sum + p.total_roubou, 0) },
    { name: 'Flagrados', value: results.reduce((sum: number, p: any) => sum + p.total_foi_pego, 0) }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Game Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🎮 Jogo #{game.id} - Detalhes
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Jogadores</div>
            <div className="text-xl font-bold text-blue-600">{game.total_jogadores}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rodadas</div>
            <div className="text-xl font-bold text-green-600">{game.total_rodadas_jogadas}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Peixes Finais</div>
            <div className={`text-xl font-bold ${game.quantidade_peixes_lago_final === 0 ? 'text-red-600' : 'text-cyan-600'}`}>
              {game.quantidade_peixes_lago_final} 🐟
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Banca Final</div>
            <div className="text-xl font-bold text-purple-600">R$ {game.quantidade_banca}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Limite Sustentável:</span>
            <span className="ml-2 font-semibold">{game.limite_sustentavel} peixes</span>
          </div>
          <div>
            <span className="text-gray-600">Taxa Crescimento:</span>
            <span className="ml-2 font-semibold">{game.taxa_crescimento * 100}%</span>
          </div>
          <div>
            <span className="text-gray-600">Custo Fiscalização:</span>
            <span className="ml-2 font-semibold">R$ {game.custo_fiscalizacao}</span>
          </div>
        </div>
      </div>

      {/* Lake Evolution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Evolução do Lago</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lakeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rodada" label={{ value: 'Rodada', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Peixes', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="peixes" stroke="#06B6D4" strokeWidth={2} name="Peixes no Lago" />
            <Line type="monotone" dataKey="pescado" stroke="#EF4444" strokeWidth={2} name="Total Pescado" />
            <Line type="monotone" dataKey="capacidade" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" name="Limite Sustentável" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Player Ranking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Ranking de Jogadores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rankingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="peixes" fill="#0088FE" name="Peixes no Cesto" />
            <Bar dataKey="pescado" fill="#00C49F" name="Total Pescado" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Behavior Analysis */}
      {behaviorData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Análise de Comportamento</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behaviorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {behaviorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Player Stats Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <h3 className="text-xl font-bold">📊 Estatísticas Detalhadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peixes Final</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pescado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscalizou</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roubou</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foi Pego</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foi Fiscalizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results
                .sort((a: any, b: any) => a.position - b.position)
                .map((player: any) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        player.position === 1 ? 'text-yellow-600' :
                        player.position === 2 ? 'text-gray-400' :
                        player.position === 3 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        #{player.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{player.peixes_cesto_final} 🐟</td>
                    <td className="px-4 py-3">{player.total_pescado}</td>
                    <td className="px-4 py-3">{player.total_fiscalizou}</td>
                    <td className="px-4 py-3 text-red-600">{player.total_roubou}</td>
                    <td className="px-4 py-3 text-orange-600">{player.total_foi_pego}</td>
                    <td className="px-4 py-3">{player.total_fiscalizado}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Round by Round Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔄 Detalhes por Rodada</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {rounds.map((round: any) => (
            <div key={round.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">Rodada {round.round_number}</span>
                <span className="text-sm text-gray-600">
                  {round.peixes_lago_pos_crescimento} peixes no lago
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                <div>🎣 Pescado: {round.total_pescado_rodada}</div>
                <div>👁️ Fiscalizações: {round.total_fiscalizacoes}</div>
                <div>🚫 Roubos: {round.total_roubos}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
