'use client'

import NextLink from 'next/link'
import { Box, Container, Heading, Text, Button, VStack, Badge } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

function formatModeLabel(mode: string) {
  return mode
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function PlayModePage({ params }: { params: { mode: string } }) {
  const modeLabel = formatModeLabel(decodeURIComponent(params.mode))

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
          <Badge
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            letterSpacing="0.08em"
            textTransform="uppercase"
            bg="rgba(56, 189, 248, 0.16)"
            border="1px solid rgba(56, 189, 248, 0.35)"
            color="cyan.200"
          >
            Pré-lobby
          </Badge>
          <Heading size="lg">{modeLabel}</Heading>
          <Text color="whiteAlpha.700">
            Em breve: sala dedicada, matchmaking e economia do modo. Estamos preparando a experiência.
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
