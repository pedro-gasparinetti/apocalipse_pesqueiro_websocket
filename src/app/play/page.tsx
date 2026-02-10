'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Heading, Text, Button, VStack, Spinner, Center } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import NextLink from 'next/link'
import GameRoom from '../components/GameRoom'
import { insertCoin } from '../lib/socket-client'

export default function PlayPage() {
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    // Conectar automaticamente ao entrar na página
    async function connect() {
      try {
        console.log('[PlayPage] Conectando ao servidor...')
        await insertCoin({ skipLobby: true })
        console.log('[PlayPage] Conectado com sucesso!')
        setIsConnecting(false)
        setGameStarted(true)
      } catch (err: any) {
        console.error('[PlayPage] Erro ao conectar:', err)
        setError(err.message || 'Erro ao conectar ao servidor')
        setIsConnecting(false)
      }
    }

    connect()
  }, [])

  if (isConnecting) {
    return (
      <Box
        minH="100vh"
        bg="#050B11"
        color="whiteAlpha.900"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.400" thickness="4px" />
          <Heading size="md">Conectando ao servidor...</Heading>
          <Text color="whiteAlpha.700">Aguarde enquanto preparamos sua partida</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        minH="100vh"
        bg="#050B11"
        color="whiteAlpha.900"
        display="flex"
        alignItems="center"
      >
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <VStack align="flex-start" spacing={4}>
            <Heading size="lg" color="red.400">Erro ao conectar</Heading>
            <Text color="whiteAlpha.700">{error}</Text>
            <Text color="whiteAlpha.600" fontSize="sm">
              Certifique-se de que o servidor está rodando em http://localhost:3001
            </Text>
            <Button
              as={NextLink}
              href="/"
              variant="outline"
              borderColor="rgba(255, 255, 255, 0.24)"
              color="whiteAlpha.900"
              leftIcon={<FiArrowLeft />}
            >
              Voltar para a home
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (gameStarted) {
    return <GameRoom />
  }

  return null
}
