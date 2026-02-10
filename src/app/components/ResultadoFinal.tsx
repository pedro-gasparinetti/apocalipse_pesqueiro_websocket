import React, { useState } from 'react'
import { Rodada } from '../types/Rodada'
import { PlayerState } from '../types/SocketTypes';
import { PEIXES_CESTO } from '../types/Constants';

type ResultadoFinalProps = {
  jogadores: PlayerState[] | undefined;
  quantidadeBanca: number;
  isAguardando: boolean;
  onClick?: () => void;
};

export default function ResultadoFinal(resultadoFinalProps: ResultadoFinalProps) {

  const handleResultadoClick = () => {
    if (resultadoFinalProps.onClick) {
      resultadoFinalProps.onClick();
    }
  }

  return (
    <div className="relative w-full max-w-3xl rounded-2xl bg-white/90 shadow-xl border border-gray-200 p-8 mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultado</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Ranking</h2>

        <ol className="space-y-3 mb-8">
          {resultadoFinalProps.jogadores?.sort(
            (a, b) => b.getState(PEIXES_CESTO) - a.getState(PEIXES_CESTO)
          ).map((jogador, index) => (
            <li
              key={jogador.id}
              className={`flex justify-between items-center p-3 rounded-lg ${index === 0 ? 'bg-yellow-100' : 'bg-gray-50'
                }`}
            >
              <span className="font-medium">{jogador.getProfile().name}</span>
              <span className="text-blue-600 font-bold">
                {jogador.getState(PEIXES_CESTO)?.toFixed(1)} peixes
              </span>
            </li>
          ))}
        </ol>
        <h3 className="font-semibold text-gray-800">Resultado da Banca</h3>
        <p className="text-gray-700 mb-6">Quantidade final da Banca: {resultadoFinalProps.quantidadeBanca}</p>

        <button
          onClick={handleResultadoClick}
          className={(resultadoFinalProps.isAguardando ? `bg-cyan-600 text-gray` : `bg-cyan-800 text-white`) + " rounded-md border-2 px-4 py-2 mb-4 w-full"}
        >
          {resultadoFinalProps.isAguardando ? "Aguardando demais jogadores..." : "Reiniciar"}
        </button>
      </div>
    </div>
  );
}
