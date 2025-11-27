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

export default function NewGameRoom() {
  const toast = useToast()
  const { isOpen: isInstructionsOpen, onOpen: onInstructionsOpen, onClose: onInstructionsClose } = useDisclosure()
  const { isOpen: isStatsOpen, onToggle: onStatsToggle } = useDisclosure()
  const { isOpen: isRoundCompleteOpen, onOpen: onRoundCompleteOpen, onClose: onRoundCompleteClose } = useDisclosure()

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState)
  const [quantidadePescada, setQuantidadePescada] = useState<number>(0)
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null)
  const [isAguardando, setIsAguardando] = useState(false)
  const [previousRoundCount, setPreviousRoundCount] = useState(0)
  const mensagemRef = useRef<HTMLInputElement>(null)
  const shownJoinNotifications = useRef<Set<string>>(new Set())

  const jogadores = usePlayersList(true)
  const jogadasPendentes = usePlayersState(JOGADA_PENDENTE)

  // Initialize game
  useEffect(() => {
    async function setGame() {
      await insertCoin({ matchmaking: true, skipLobby: true })

      const me = myPlayer()
      if (me) {
        me.setState(PEIXES_CESTO, 0)
        // Add myself to known players (no notification for myself)
        shownJoinNotifications.current.add(me.id)
        // Open instructions on first load
        onInstructionsOpen()
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

  const myFishCount = myPlayer()?.getState(PEIXES_CESTO) || 0
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

  if (!myPlayer()?.id) {
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
    <Box minH="100vh" bg="gray.50" pb={8}>
      {/* Header */}
      <Box bg="brand.500" color="white" py={6} px={4} boxShadow="md">
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
              <IconButton
                aria-label="Stats"
                icon={<FaChartBar />}
                onClick={onStatsToggle}
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

      <Container maxW="container.xl" mt={8}>
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

          {/* Lake Scene */}
          <LakeScene
            fishCount={gameState.quantidadePeixesLago}
            playerCount={jogadores.length}
            currentRound={currentRound}
            isGameActive={!gameState.jogoFinalizado}
          />

          {/* Main Game Area */}
          {!gameState.jogoFinalizado ? (
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Fishing Control */}
                  <Card borderRadius="xl" boxShadow="md">
                    <Box bg="lake.500" px={6} py={4} color="white">
                      <Heading size="md">Your Fishing Decision</Heading>
                    </Box>
                    <CardBody>
                      <VStack spacing={6}>
                        <Box w="100%">
                          <HStack justify="space-between" mb={4}>
                            <Text fontWeight="600" color="gray.700">
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
                          <Text fontWeight="600" color="gray.700" mb={2}>
                            Inspection cost: <Badge colorScheme="red">{gameState.custoFiscalizacao}</Badge> fish
                          </Text>
                          <Text fontSize="sm" color="gray.600">
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
                  <Leaderboard players={leaderboardPlayers} currentPlayerId={myPlayer()?.id} />

                  {/* Chat Box */}
                  <ChatBox
                    messages={gameState.conteudoChat}
                    players={jogadores}
                    onSendMessage={handleSendMessage}
                  />

                  {isStatsOpen && gameState.rodadas.length > 0 && (
                    <GameChart rounds={gameState.rodadas} playerCount={jogadores.length} />
                  )}
                </VStack>
              </GridItem>
            </Grid>
          ) : (
            <ResultadoFinal
              jogadores={jogadores}
              quantidadeBanca={gameState.quantidadeBanca}
              onClick={handleReiniciarClick}
              isAguardando={isAguardando}
            />
          )}
        </VStack>
      </Container>

      {/* Instructions Modal */}
      <InstructionsPanel isOpen={isInstructionsOpen} onClose={onInstructionsClose} gameState={gameState} />

      {/* Round Completion Modal */}
      {gameState.rodadas.length > 0 && (
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
              const lastRound = gameState.rodadas[gameState.rodadas.length - 1]
              const myPlay = lastRound?.jogadas.find((j) => j.idJogador === myPlayer()?.id)
              if (myPlay?.roubou && myPlay?.fiscalizadoPor && myPlay.fiscalizadoPor.length > 0) {
                return 0
              }
              return myPlayer()?.getState(RESULTADO_JOGADA)?.peixesPescadosJogador || 0
            })()
          }
          totalMyFish={myFishCount}
          wasCaughtCheating={
            (() => {
              const lastRound = gameState.rodadas[gameState.rodadas.length - 1]
              const myPlay = lastRound?.jogadas.find((j) => j.idJogador === myPlayer()?.id)
              return Boolean(myPlay?.roubou && myPlay?.fiscalizadoPor && myPlay.fiscalizadoPor.length > 0)
            })()
          }
          caughtSomeoneCheating={Boolean(myPlayer()?.getState(RESULTADO_JOGADA)?.rateioGanhado > 0)}
          lakeGrowth={gameState.rodadas[gameState.rodadas.length - 1]?.crescimentoLago || 0}
        />
      )}
    </Box>
  )
}
