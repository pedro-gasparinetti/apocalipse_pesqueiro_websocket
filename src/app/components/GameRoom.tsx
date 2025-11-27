'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  useDisclosure,
  IconButton,
  Flex,
  Badge,
  Card,
  CardBody,
  Divider,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Center,
  Input,
  SimpleGrid,
} from '@chakra-ui/react'
import { FaInfoCircle, FaRedo, FaCog, FaChartBar, FaUsers } from 'react-icons/fa'
import {
  insertCoin,
  isHost,
  myPlayer,
  onPlayerJoin,
  PlayerProfile,
  PlayerState,
  RPC,
  useMultiplayerState,
  usePlayersList,
  usePlayersState,
} from '../lib/socket-client'
import { GameState } from '../types/GameState'
import { Rodada } from '../types/Rodada'
import { Jogada } from '../types/Jogada'
import { JOGADA_PENDENTE, PEIXES_CESTO, RESULTADO_JOGADA, ULTIMA_MENSAGEM } from '../types/Constants'
import { distribuirPeixesProporcional } from '../service/Distribuicao'
import InstructionsPanel from './InstructionsPanel'
import LakeScene from './LakeScene'
import Leaderboard from './Leaderboard'
import GameChart from './GameChart'
import PlayerSelector from './PlayerSelector'
import GameStats from './GameStats'
import ResultadoFinal from './ResultadoFinal'
import ChatBox from './ChatBox'
import RoundCompletionModal from './RoundCompletionModal'
import { MENSAGEM_PENDENTE } from '../types/Constants'
import { Table, Thead, Tbody, Tr, Th, Td, Tag, TagLabel } from '@chakra-ui/react'

interface GameRoomProps {
  fullScreenLake?: boolean
}

function RoundSummaryTable({
  gameState,
  meId,
  custoFiscalizacao,
  jogadores,
}: {
  gameState: GameState
  meId?: string
  custoFiscalizacao: number
  jogadores: PlayerState[]
}) {
  const totalRounds = Math.max(gameState.limiteRodadas, gameState.rodadas.length)
  const ranking = [...jogadores].sort((a, b) => (b.getState(PEIXES_CESTO) || 0) - (a.getState(PEIXES_CESTO) || 0))

  return (
    <Card borderRadius="2xl" boxShadow="float">
      <Box px={6} py={4} borderBottom="1px solid" borderColor="rgba(12,18,31,0.08)">
        <Heading size="md">Resumo das Rodadas</Heading>
      </Box>
      <CardBody overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Rodada</Th>
              <Th>Peixes no Lago</Th>
              <Th>Seu resultado</Th>
              <Th>Acumulado</Th>
              <Th>Fiscalizou?</Th>
              <Th>Foi fiscalizado?</Th>
              <Th>Banca acum.</Th>
              <Th>Crescimento acum.</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: totalRounds }, (_, idx) => {
              const rodadaNumero = idx + 1
              const rodada = gameState.rodadas.find((r) => r.numero === rodadaNumero)
              const bancaAcumulada = gameState.rodadas
                .filter((r) => r.numero <= rodadaNumero)
                .reduce((acc, r) => acc + (r.saldoBanca || 0), 0)
              const crescimentoAcumulado = gameState.rodadas
                .filter((r) => r.numero <= rodadaNumero)
                .reduce((acc, r) => acc + (r.crescimentoLago || 0), 0)
              const jogada = rodada?.jogadas.find((j) => j.idJogador === meId)
              let pescou = '-'
              let acumulado = '-'
              if (rodada && jogada && meId) {
                if (jogada.roubou && jogada.fiscalizadoPor && jogada.fiscalizadoPor.length > 0) {
                  pescou = '0 (fiscalizado)'
                } else {
                  const distrib = distribuirPeixesProporcional(
                    rodada.jogadas.map((j) => ({ idJogador: j.idJogador, quantidadePescada: j.quantidadePescada })),
                    rodada.quantidadeLagoInicial
                  )
                  let pescouVal = distrib[meId] || 0
                  pescouVal -= jogada.jogadorAFiscalizar ? custoFiscalizacao : 0
                  if (jogada.jogadorAFiscalizar) {
                    const fiscalizado = rodada.jogadas.find((j) => j.idJogador === jogada.jogadorAFiscalizar)
                    if (fiscalizado?.roubou && fiscalizado?.rateioPerdido) {
                      pescouVal += fiscalizado.rateioPerdido
                    }
                  }
                  pescou = pescouVal.toFixed(1)
                }

                // acumulado até esta rodada
                let accVal = 0
                gameState.rodadas
                  .filter((r) => r.numero <= rodadaNumero)
                  .forEach((r) => {
                    const j = r.jogadas.find((jg) => jg.idJogador === meId)
                    if (!j) return
                    if (j.roubou && j.fiscalizadoPor && j.fiscalizadoPor.length > 0) return
                    const distrib = distribuirPeixesProporcional(
                      r.jogadas.map((jg) => ({ idJogador: jg.idJogador, quantidadePescada: jg.quantidadePescada })),
                      r.quantidadeLagoInicial
                    )
                    let val = distrib[meId] || 0
                    val -= j.jogadorAFiscalizar ? custoFiscalizacao : 0
                    if (j.jogadorAFiscalizar) {
                      const fiscalizado = r.jogadas.find((jf) => jf.idJogador === j.jogadorAFiscalizar)
                      if (fiscalizado?.roubou && fiscalizado?.rateioPerdido) {
                        val += fiscalizado.rateioPerdido
                      }
                    }
                    accVal += val
                  })
                acumulado = accVal.toFixed(1)
              }

              return (
                <Tr key={rodadaNumero} opacity={rodada ? 1 : 0.6}>
                  <Td>{rodadaNumero}</Td>
                  <Td>{rodada ? rodada.quantidadeLagoInicial.toFixed(1) : '-'}</Td>
                  <Td>{pescou}</Td>
                  <Td fontWeight="700">{acumulado}</Td>
                  <Td>{jogada ? (jogada.jogadorAFiscalizar ? '✓' : '✗') : '-'}</Td>
                  <Td>{jogada ? (jogada.fiscalizadoPor && jogada.fiscalizadoPor.length > 0 ? '✓' : '✗') : '-'}</Td>
                  <Td>{rodada ? bancaAcumulada.toFixed(1) : '-'}</Td>
                  <Td>{rodada ? crescimentoAcumulado.toFixed(1) : '-'}</Td>
                </Tr>
              )
            })}
            <Tr bg="rgba(91,141,239,0.08)">
              <Td fontWeight="700">Total</Td>
              <Td>-</Td>
              <Td>-</Td>
              <Td fontWeight="800">{(gameState.rodadas.length > 0 && meId ? computeTotal(gameState, meId, custoFiscalizacao) : 0).toFixed(1)}</Td>
              <Td>{gameState.rodadas.filter((r) => r.jogadas.some((j) => j.idJogador === meId && j.jogadorAFiscalizar)).length}</Td>
              <Td>{gameState.rodadas.filter((r) => r.jogadas.some((j) => j.idJogador === meId && j.fiscalizadoPor && j.fiscalizadoPor.length > 0)).length}</Td>
              <Td>{gameState.quantidadeBanca.toFixed(1)}</Td>
              <Td>{gameState.rodadas.reduce((acc, r) => acc + (r.crescimentoLago || 0), 0).toFixed(1)}</Td>
            </Tr>
          </Tbody>
        </Table>
        <Box mt={6}>
          <Heading size="sm" mb={3}>
            Ranking Final
          </Heading>
          <VStack align="stretch" spacing={2}>
            {ranking.map((player, idx) => (
              <HStack
                key={player.id}
                justify="space-between"
                px={3}
                py={2}
                borderRadius="md"
                bg={idx === 0 ? 'rgba(255,235,59,0.2)' : 'rgba(12,18,31,0.03)'}
                border="1px solid rgba(12,18,31,0.08)"
              >
                <HStack spacing={2}>
                  <Tag borderRadius="full" colorScheme="accent">
                    <TagLabel>#{idx + 1}</TagLabel>
                  </Tag>
                  <Text fontWeight="600">{player.getProfile().name}</Text>
                  {player.id === meId && <Badge colorScheme="accent">Você</Badge>}
                </HStack>
                <Text fontWeight="700" color="accent.600">
                  {(player.getState(PEIXES_CESTO) || 0).toFixed(1)} peixes
                </Text>
              </HStack>
            ))}
          </VStack>
          <HStack justify="space-between" mt={4}>
            <Text fontWeight="600">Resultado da Banca</Text>
            <Text fontWeight="700">{gameState.quantidadeBanca.toFixed(1)}</Text>
          </HStack>
        </Box>
      </CardBody>
    </Card>
  )
}

function computeTotal(gameState: GameState, meId: string, custoFiscalizacao: number) {
  return gameState.rodadas.reduce((acc, r) => {
    const j = r.jogadas.find((jg) => jg.idJogador === meId)
    if (!j) return acc
    if (j.roubou && j.fiscalizadoPor && j.fiscalizadoPor.length > 0) return acc
    const distrib = distribuirPeixesProporcional(
      r.jogadas.map((jg) => ({ idJogador: jg.idJogador, quantidadePescada: jg.quantidadePescada })),
      r.quantidadeLagoInicial
    )
    let val = distrib[meId] || 0
    val -= j.jogadorAFiscalizar ? custoFiscalizacao : 0
    if (j.jogadorAFiscalizar) {
      const fiscalizado = r.jogadas.find((jf) => jf.idJogador === j.jogadorAFiscalizar)
      if (fiscalizado?.roubou && fiscalizado?.rateioPerdido) {
        val += fiscalizado.rateioPerdido
      }
    }
    return acc + val
  }, 0)
}

const initialState: GameState = {
  limiteSustentavel: 11,
  limitePossivelRodada: 20,
  limiteRodadas: 10,
  jogoFinalizado: false,
  taxaCrescimento: 0.02,
  custoFiscalizacao: 2,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  quantidadeBanca: 0,
  conteudoChat: [],
  rodadas: [],
}

export default function GameRoom({ fullScreenLake = false }: GameRoomProps) {
  const toast = useToast({ position: 'top-right' })
  const { isOpen: isInstructionsOpen, onOpen: onInstructionsOpen, onClose: onInstructionsClose } = useDisclosure()
  const { isOpen: isStatsOpen, onToggle: onStatsToggle } = useDisclosure()
  const { isOpen: isRoundCompleteOpen, onOpen: onRoundCompleteOpen, onClose: onRoundCompleteClose } = useDisclosure()
  const { isOpen: isConfigOpen, onToggle: onConfigToggle } = useDisclosure()

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState)
  const [quantidadePescada, setQuantidadePescada] = useState<number>(0)
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null)
  const [isAguardando, setIsAguardando] = useState(false)
  const [previousRoundCount, setPreviousRoundCount] = useState(0)
  const mensagemRef = useRef<HTMLInputElement>(null)
  const shownJoinNotifications = useRef<Set<string>>(new Set())

  const jogadores = usePlayersList(true)
  const jogadasPendentes = usePlayersState(JOGADA_PENDENTE)
  const me = myPlayer()

  // Initialize game
  useEffect(() => {
    async function setGame() {
      await insertCoin({ matchmaking: true, skipLobby: true })

      const me = myPlayer()
      if (me) {
        me.setState(PEIXES_CESTO, 0)
        // Add myself to known players (no notification for myself)
        shownJoinNotifications.current.add(me.id)
      }

      onPlayerJoin((playerState: PlayerState) => {
        console.log('[DEBUG] onPlayerJoin called for:', playerState.getProfile().name, 'ID:', playerState.id)
        playerState.setState(PEIXES_CESTO, 0)

        // Only show notification if this is a NEW player we haven't seen before
        const playerId = playerState.id
        const isNewPlayer = !shownJoinNotifications.current.has(playerId)

        if (isNewPlayer) {
          console.log('[DEBUG] Showing join notification for NEW player:', playerState.getProfile().name)
          shownJoinNotifications.current.add(playerId)

          // Don't show notification for myself
          if (playerId !== myPlayer()?.id) {
            toast({
              title: 'Player joined',
              description: `${playerState.getProfile().name} joined the game`,
              status: 'info',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            })
          }
        } else {
          console.log('[DEBUG] Skipping notification for existing player:', playerState.getProfile().name)
        }

        playerState.onQuit(() => {
          console.log(playerState.getProfile().name + ' left the game')
          // Remove from the set when player quits
          shownJoinNotifications.current.delete(playerId)

          toast({
            title: 'Player left',
            description: `${playerState.getProfile().name} left the game`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          })
        })
      })
    }

    setGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Register RPC handlers
  useEffect(() => {
    RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {
      console.log('[DEBUG] Jogada realizada por:', caller?.getProfile().name, 'data:', data)
      caller?.setState(JOGADA_PENDENTE, data, true)
    })

    RPC.register('mensagemEnviada', async (mensagem: any, caller: PlayerState) => {
      console.log('mensagemEnviada: ' + mensagem)
      gameState.conteudoChat.push(`${caller?.getProfile().name}: ${mensagem}`)
      caller.setState(ULTIMA_MENSAGEM, mensagem)
      setGameState(gameState, true)
    })

    return () => {
      RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {})
      RPC.register('mensagemEnviada', async (mensagem: any, caller: PlayerState) => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Process rounds when all plays are submitted
  useEffect(() => {
    if (isHost()) {
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null)

      if (
        jogadasPendentes.length > 0 &&
        jogadasNaoRealizadas.length == 0 &&
        jogadasPendentes.length == jogadores.length
      ) {
        console.log('[DEBUG] All plays submitted - processing round')

        const novoGameState = { ...gameState }
        const rodadaAtual: Rodada = {
          numero: gameState.rodadas.length + 1,
          quantidadeLagoInicial: gameState.quantidadePeixesLago,
          jogadas: [],
          crescimentoLago: gameState.quantidadePeixesLago * gameState.taxaCrescimento,
        }

        const jogadoresFiscalizados = jogadasPendentes.reduce(
          (acc: Record<string, PlayerState[]>, jogada) => {
            const jogadorAFiscalizar = jogada.state.jogadorAFiscalizar
            acc[jogadorAFiscalizar] = acc[jogadorAFiscalizar] || []
            acc[jogadorAFiscalizar].push(jogada.player)
            return acc
          },
          {} as Record<string, PlayerState[]>
        )

        const limitePeixesPossiveis = distribuirPeixesProporcional(
          jogadasPendentes.map((jogada) => {
            return { idJogador: jogada.player.id, quantidadePescada: jogada.state.quantidadePescada }
          }),
          rodadaAtual.quantidadeLagoInicial
        )

        let somaPeixesNosCestos = 0
        let somaBancaNaRodada = 0

        jogadasPendentes.forEach((jogadaPendente) => {
          const jogada: Jogada = {
            idJogador: jogadaPendente.player.id,
            quantidadePescada: jogadaPendente.state.quantidadePescada,
            jogadorAFiscalizar: jogadaPendente.state.jogadorAFiscalizar,
            quantidadeAcumulada: 0,
            fiscalizadoPor: [],
            roubou: false,
            multa: 0,
            rateioGanhado: 0,
            rateioPerdido: 0,
          }

          const peixesCesto = jogadaPendente.player.getState(PEIXES_CESTO)
          let peixesPescadosJogador = limitePeixesPossiveis[jogadaPendente.player.id]
          peixesPescadosJogador -= jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0

          jogada.roubou = peixesPescadosJogador > gameState.limiteSustentavel
          jogada.fiscalizadoPor = jogadoresFiscalizados[jogadaPendente.player.id]?.map(
            (fiscalizador: PlayerState) => {
              return fiscalizador.getProfile()
            }
          )

          if (jogada.roubou && jogada.fiscalizadoPor?.length > 0) {
            jogada.multa = 0.1 * peixesPescadosJogador
            jogada.rateioPerdido = (0.9 * peixesPescadosJogador) / jogadoresFiscalizados[jogadaPendente.player.id].length

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {}
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor
            resultadoJogadaJogador.crescimentoLago = rodadaAtual.crescimentoLago
            resultadoJogadaJogador.roubou = true
            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true)

            jogadoresFiscalizados[jogadaPendente.player.id].forEach((fiscalizador) => {
              const peixesCestoFiscalizador = fiscalizador.getState(PEIXES_CESTO)
              fiscalizador.setState(PEIXES_CESTO, peixesCestoFiscalizador + jogada.rateioPerdido, true)

              let resultadoJogadaFiscalizador = fiscalizador.getState(RESULTADO_JOGADA) || {}
              resultadoJogadaFiscalizador.rateioGanhado = jogada.rateioPerdido
              fiscalizador.setState(RESULTADO_JOGADA, resultadoJogadaFiscalizador, true)

              somaPeixesNosCestos += jogada.rateioPerdido
            })

            novoGameState.quantidadeBanca += jogada.multa
            somaBancaNaRodada += jogada.multa
          } else {
            jogada.quantidadeAcumulada = peixesCesto + peixesPescadosJogador
            jogadaPendente.player.setState(PEIXES_CESTO, jogada.quantidadeAcumulada, true)

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {}
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor
            resultadoJogadaJogador.peixesPescadosJogador = peixesPescadosJogador
            resultadoJogadaJogador.crescimentoLago = rodadaAtual.crescimentoLago
            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true)

            novoGameState.quantidadeBanca += jogadaPendente.state.jogadorAFiscalizar
              ? gameState.custoFiscalizacao
              : 0
            somaBancaNaRodada += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0
            somaPeixesNosCestos += peixesPescadosJogador
          }

          jogadaPendente.player.setState(JOGADA_PENDENTE, null, true)
          rodadaAtual.jogadas.push(jogada)
        })

        rodadaAtual.quantidadeNosCestos = somaPeixesNosCestos
        rodadaAtual.quantidadeLagoFinal =
          gameState.quantidadePeixesLago - somaPeixesNosCestos - somaBancaNaRodada + rodadaAtual.crescimentoLago
        rodadaAtual.saldoBanca = somaBancaNaRodada

        novoGameState.quantidadePeixesLago = rodadaAtual.quantidadeLagoFinal
        novoGameState.rodadas.push(rodadaAtual)
        novoGameState.jogoFinalizado =
          rodadaAtual.numero == gameState.limiteRodadas || rodadaAtual.quantidadeLagoFinal < 1

        setGameState(novoGameState, true)
      }
    }
  }, [gameState, jogadasPendentes, jogadores, setGameState])

  // Check if all players have submitted and hide waiting message
  useEffect(() => {
    if (isAguardando) {
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null)
      const allPlaysSubmitted = jogadasPendentes.length > 0 &&
                                jogadasNaoRealizadas.length === 0 &&
                                jogadasPendentes.length === jogadores.length

      if (allPlaysSubmitted) {
        // All plays submitted, hide waiting message immediately
        setIsAguardando(false)
      }
    }
  }, [isAguardando, jogadasPendentes, jogadores.length])

  // Reset waiting state after round and show completion modal
  useEffect(() => {
    if (gameState.rodadas.length > previousRoundCount && gameState.rodadas.length > 0) {
      setIsAguardando(false)
      setPreviousRoundCount(gameState.rodadas.length)
      // Show round completion modal
      setTimeout(() => {
        onRoundCompleteOpen()
      }, 500)
    }
  }, [gameState.rodadas.length, previousRoundCount, onRoundCompleteOpen])

  // Update lake fish count when players join
  useEffect(() => {
    if (isHost()) {
      const novoGameState = {
        ...gameState,
        quantidadePeixesLago: jogadores.length * gameState.quantidadeInicialPeixesJogador,
      }
      setGameState(novoGameState, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadores.length, gameState.quantidadeInicialPeixesJogador])

  const handlePescar = () => {
    if (quantidadePescada > gameState.limitePossivelRodada) {
      toast({
        title: 'Invalid catch amount',
        description: `You cannot catch more than ${gameState.limitePossivelRodada} fish per round`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    if (quantidadePescada > gameState.limiteSustentavel && jogadorAFiscalizar != null) {
      toast({
        title: 'Invalid action',
        description: 'You cannot overfish AND inspect someone in the same round',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    const jogada = { quantidadePescada, jogadorAFiscalizar }

    const jogadorAtual = myPlayer()
    if (jogadorAtual) {
      jogadorAtual.setState(JOGADA_PENDENTE, jogada, true)
    }

    RPC.call('jogadaRealizada', jogada, RPC.Mode.HOST)
    setIsAguardando(true)

    toast({
      title: 'Play submitted',
      description: 'Waiting for other players...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleReiniciarClick = () => {
    if (isHost()) {
      jogadores.forEach((jogador) => {
        jogador.setState(PEIXES_CESTO, 0, true)
        jogador.setState(RESULTADO_JOGADA, null, true)
      })
      const gameStateInicial = {
        ...initialState,
        quantidadePeixesLago: jogadores.length * initialState.quantidadeInicialPeixesJogador,
      }
      setGameState(gameStateInicial, true)
      setIsAguardando(false)
    }
  }

  const handlePlayerClick = (id: string) => {
    if (jogadorAFiscalizar !== id) {
      setJogadorAFiscalizar(id)
    } else {
      setJogadorAFiscalizar(null)
    }
  }

  const handleSendMessage = (message: string) => {
    RPC.call('mensagemEnviada', message, RPC.Mode.HOST)
  }

  const computeMyTotals = () => {
    const meFromList = jogadores.find((j) => j.id === me?.id)
    const fishFromPlayers = meFromList?.getState(PEIXES_CESTO)
    if (typeof fishFromPlayers === 'number') return fishFromPlayers
    if (me?.getState(PEIXES_CESTO) != null) return me.getState(PEIXES_CESTO) as number
    // Fallback: sum from rounds if state missing
    return gameState.rodadas.reduce((acc, r) => {
      const j = r.jogadas.find((jg) => jg.idJogador === me?.id)
      if (!j) return acc
      if (j.roubou && j.fiscalizadoPor && j.fiscalizadoPor.length > 0) return acc
      const distrib = distribuirPeixesProporcional(
        r.jogadas.map((jg) => ({ idJogador: jg.idJogador, quantidadePescada: jg.quantidadePescada })),
        r.quantidadeLagoInicial
      )
      let pescou = distrib[me?.id || ''] || 0
      pescou -= j.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0
      if (j.jogadorAFiscalizar) {
        const fiscalizado = r.jogadas.find((jf) => jf.idJogador === j.jogadorAFiscalizar)
        if (fiscalizado?.roubou && fiscalizado?.rateioPerdido) {
          pescou += fiscalizado.rateioPerdido
        }
      }
      return acc + pescou
    }, 0)
  }

  const myFishCount = computeMyTotals()
  const lastRound = gameState.rodadas[gameState.rodadas.length - 1]
  const currentRound = gameState.rodadas.length + 1
  const canInspect = quantidadePescada <= gameState.limiteSustentavel

  const leaderboardPlayers = jogadores.map((j) => ({
    id: j.id,
    name: j.getProfile().name,
    photo: j.getProfile().photo,
    fishCount: j.getState(PEIXES_CESTO) || 0,
  }))

  const otherPlayers = jogadores
    .filter((j) => j.id !== myPlayer()?.id)
    .map((j) => ({
      id: j.id,
      name: j.getProfile().name,
      photo: j.getProfile().photo,
      message: j.getState(ULTIMA_MENSAGEM),
    }))

  if (!me?.id) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text fontSize="xl" fontWeight="600" color="gray.600">
            Connecting to game...
          </Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box
      minH="100vh"
      pb={8}
      position="relative"
      overflow="hidden"
      bg={fullScreenLake ? 'transparent' : 'gray.50'}
    >
      {fullScreenLake && (
        <Box position="fixed" inset={0} zIndex={-1} pointerEvents="none">
          <LakeScene
            fishCount={gameState.quantidadePeixesLago}
            playerCount={jogadores.length}
            currentRound={currentRound}
            isGameActive={!gameState.jogoFinalizado}
            height="100vh"
            backgroundColor={0x0d1723}
            fishOpacity={0.5}
            boatColors={[0x6b5845, 0x4a4f55, 0x8c7a65, 0x5c5750]}
            speedFactor={0.6}
            fishSize={6}
            fishTrailSize={3}
            fishTrailLength={18}
            boatSize={32}
            surface={{ enabled: true, opacity: 0.06, tint: 0xffffff }}
            fullScreen
          />
        </Box>
      )}
      {/* Header */}
      <Box
        //bg="brand.500"
        bg="transparent"
        color="white"
        py={6}
        px={4}
        boxShadow="none"
        position="relative"
        zIndex={2}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Heading size="lg">Common Pool Resource Game</Heading>
            <HStack spacing={2}>
              <IconButton
                aria-label="Instructions"
                icon={<FaInfoCircle />}
                onClick={onInstructionsOpen}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
              <IconButton aria-label="Stats" icon={<FaChartBar />} onClick={onStatsToggle} variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.200' }} />
              <IconButton
                aria-label="Game parameters"
                icon={<FaCog />}
                onClick={onConfigToggle}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
              {isHost() && (
                <IconButton
                  aria-label="Restart Game"
                  icon={<FaRedo />}
                  onClick={handleReiniciarClick}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container
        maxW={fullScreenLake ? '1200px' : 'container.xl'}
        mt={8}
        position="relative"
        zIndex={1}
        px={fullScreenLake ? { base: 4, md: 6 } : undefined}
      >
        <VStack spacing={8} align="stretch">
          {/* Game Stats */}
          <GameStats
            myFishCount={myFishCount}
            lakeFishCount={gameState.quantidadePeixesLago}
            bankTotal={gameState.quantidadeBanca}
            currentRound={currentRound}
          totalRounds={gameState.limiteRodadas}
          growthRate={gameState.taxaCrescimento}
        />

          {isStatsOpen && (
            <Card borderRadius="2xl" boxShadow="float" p={4}>
              <GameChart rounds={gameState.rodadas} playerCount={jogadores.length} />
            </Card>
          )}

          {isConfigOpen && (
            <Card borderRadius="2xl" boxShadow="float">
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Game Parameters</Heading>
                  {!isHost() && <Badge colorScheme="blue">Read only</Badge>}
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {[
                    { label: 'Limite sustentável', key: 'limiteSustentavel', step: 1, min: 1, max: 50 },
                    { label: 'Limite por rodada', key: 'limitePossivelRodada', step: 1, min: 1, max: 100 },
                    { label: 'Custo fiscalização', key: 'custoFiscalizacao', step: 1, min: 0, max: 10 },
                    { label: 'Taxa crescimento (%)', key: 'taxaCrescimento', step: 0.01, min: 0, max: 0.5, isPercent: true },
                    { label: 'Rodadas', key: 'limiteRodadas', step: 1, min: 1, max: 20 },
                    { label: 'Peixes iniciais por jogador', key: 'quantidadeInicialPeixesJogador', step: 10, min: 10, max: 500 },
                  ].map((item) => (
                    <Box key={item.key}>
                      <Text fontWeight="600" fontSize="sm" mb={1}>{item.label}</Text>
                      <Input
                        type="number"
                        value={
                          item.key === 'taxaCrescimento'
                            ? (gameState.taxaCrescimento ?? 0)
                            : (gameState as any)[item.key] ?? 0
                        }
                        onChange={(e) => {
                          if (!isHost() || gameState.rodadas.length > 0) return
                          const val = Number(e.target.value)
                          const patch: any = {}
                          patch[item.key] = item.key === 'taxaCrescimento' ? val : Math.max(item.min, Math.min(item.max, val))
                          const newState = { ...gameState, ...patch }
                          setGameState(newState, true)
                        }}
                        isDisabled={!isHost() || gameState.rodadas.length > 0}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Lake Scene */}
          {!fullScreenLake && (
            <LakeScene
              fishCount={gameState.quantidadePeixesLago}
              playerCount={jogadores.length}
              currentRound={currentRound}
              isGameActive={!gameState.jogoFinalizado}
              height="420px"
            />
          )}

          {/* Main Game Area */}
          {!gameState.jogoFinalizado ? (
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Fishing Control */}
                  <Card borderRadius="xl" boxShadow="float" bg="rgba(255,255,255,0.01)" _dark={{ bg: 'rgba(14,18,28,0.95)' }} border="1px solid rgba(255,255,255,0.1)">
                    <Box bgGradient="linear(to-r, accent.500, accent.600)" px={6} py={4} color="white" bg="transparent">
                      <Heading size="md">Your Fishing Decision</Heading>
                    </Box>
                    <CardBody>
                      <VStack spacing={6}>
                        <Box w="100%">
                          <HStack justify="space-between" mb={4}>
                            <Text fontWeight="600" color="gray.100">
                              How many fish will you catch?
                            </Text>
                            <HStack>
                              <Badge
                                colorScheme={quantidadePescada > gameState.limiteSustentavel ? 'red' : 'green'}
                                fontSize="lg"
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {quantidadePescada}
                              </Badge>
                              {quantidadePescada > gameState.limiteSustentavel && (
                                <Badge colorScheme="orange">Overfishing!</Badge>
                              )}
                            </HStack>
                          </HStack>

                          <Slider
                            value={quantidadePescada}
                            onChange={setQuantidadePescada}
                            min={0}
                            max={gameState.limitePossivelRodada}
                            step={1}
                            isDisabled={isAguardando}
                          >
                            <SliderMark value={gameState.limiteSustentavel} mt={-10} fontSize="sm">
                              <Badge colorScheme="green">Sustainable</Badge>
                            </SliderMark>
                            <SliderTrack bg="gray.200">
                              <SliderFilledTrack
                                bg={quantidadePescada > gameState.limiteSustentavel ? 'danger.500' : 'success.500'}
                              />
                            </SliderTrack>
                            <SliderThumb boxSize={6} />
                          </Slider>

                          <HStack justify="space-between" mt={2} fontSize="sm" color="gray.500">
                            <Text>0</Text>
                            <Text>Max: {gameState.limitePossivelRodada}</Text>
                          </HStack>
                        </Box>

                        <Divider />

                        <Box w="100%">
                          <Text fontWeight="600" color="gray.100" mb={2}>
                            Inspection cost: <Badge colorScheme="red">{gameState.custoFiscalizacao}</Badge> fish
                          </Text>
                          <Text fontSize="sm" color="gray.100">
                            {jogadorAFiscalizar
                              ? `You are inspecting a player (costs ${gameState.custoFiscalizacao} fish)`
                              : 'Select a player below to inspect them'}
                          </Text>
                        </Box>

                        <Button
                          onClick={handlePescar}
                          isDisabled={isAguardando}
                          isLoading={isAguardando}
                          loadingText="Waiting for others..."
                          colorScheme="brand"
                          size="lg"
                          w="100%"
                          height="60px"
                          fontSize="xl"
                        >
                          {isAguardando ? 'Waiting for other players...' : 'Submit Your Play'}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Player Selection */}
                  <PlayerSelector
                    players={otherPlayers}
                    selectedPlayerId={jogadorAFiscalizar}
                    onSelectPlayer={handlePlayerClick}
                    canInspect={canInspect}
                  />
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={6} align="stretch">
                  <Leaderboard players={leaderboardPlayers} currentPlayerId={me?.id} />
                  <ChatBox messages={gameState.conteudoChat} players={jogadores} onSendMessage={handleSendMessage} />
                </VStack>
              </GridItem>
            </Grid>
          ) : (
            <RoundSummaryTable
              gameState={gameState}
              meId={me?.id}
              custoFiscalizacao={gameState.custoFiscalizacao}
              jogadores={jogadores}
            />
          )}
        </VStack>
      </Container>

      {/* Instructions Modal */}
      <InstructionsPanel isOpen={isInstructionsOpen} onClose={onInstructionsClose} gameState={gameState} />

      {/* Round Completion Modal */}
      {gameState.rodadas.length > 0 && !gameState.jogoFinalizado && (
        <RoundCompletionModal
          isOpen={isRoundCompleteOpen}
          onClose={onRoundCompleteClose}
          roundNumber={gameState.rodadas[gameState.rodadas.length - 1]?.numero || 1}
          totalRounds={gameState.limiteRodadas}
          lakeFishCount={gameState.quantidadePeixesLago}
          previousLakeFishCount={
            gameState.rodadas.length > 1
              ? gameState.rodadas[gameState.rodadas.length - 2]?.quantidadeLagoFinal || 0
              : jogadores.length * gameState.quantidadeInicialPeixesJogador
          }
          myFishCaught={
            (() => {
              if (!me || !lastRound) return 0
              const myPlay = lastRound.jogadas.find((j) => j.idJogador === me.id)
              if (!myPlay) return 0
              if (myPlay.roubou && myPlay.fiscalizadoPor && myPlay.fiscalizadoPor.length > 0) return 0
              if (typeof myPlay.quantidadePescada === 'number') return myPlay.quantidadePescada
              return me.getState(RESULTADO_JOGADA)?.peixesPescadosJogador || 0
            })()
          }
          totalMyFish={myFishCount}
          wasCaughtCheating={
            (() => {
              if (!me || !lastRound) return false
              const myPlay = lastRound.jogadas.find((j) => j.idJogador === me.id)
              return Boolean(myPlay?.roubou && myPlay?.fiscalizadoPor && myPlay.fiscalizadoPor.length > 0)
            })()
          }
          caughtSomeoneCheating={Boolean(me?.getState(RESULTADO_JOGADA)?.rateioGanhado > 0)}
          lakeGrowth={gameState.rodadas[gameState.rodadas.length - 1]?.crescimentoLago || 0}
        />
      )}
    </Box>
  )
}
