'use client'

import NextLink from 'next/link'
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

export default function PlayPage() {
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
          <Heading size="lg">Entrar em uma partida</Heading>
          <Text color="whiteAlpha.700">
            Em breve: seleção completa de salas e matchmaking. Por enquanto, escolha um modo na home.
          </Text>
          <Button
            as={NextLink}
            href="/"
            variant="outline"
            borderColor="rgba(255, 255, 255, 0.24)"
            color="whiteAlpha.900"
            rightIcon={<FiArrowRight />}
          >
            Voltar para a home
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
