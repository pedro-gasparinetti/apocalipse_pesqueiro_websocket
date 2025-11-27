'use client'

import {
  Box,
  SimpleGrid,
  Avatar,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react'
import { FaEye, FaCheckCircle } from 'react-icons/fa'

interface Player {
  id: string
  name: string
  photo: string
  message?: string
}

interface PlayerSelectorProps {
  players: Player[]
  selectedPlayerId: string | null
  onSelectPlayer: (id: string) => void
  canInspect: boolean
}

export default function PlayerSelector({
  players,
  selectedPlayerId,
  onSelectPlayer,
  canInspect,
}: PlayerSelectorProps) {
  return (
    <Card borderRadius="xl" boxShadow="float" overflow="hidden" bg="rgba(255,255,255,0.01)" _dark={{ bg: 'rgba(14,18,28,0.95)' }} border="1px solid rgba(255,255,255,0.1)">
      <Box bgGradient="linear(to-r, accent.500, accent.600)" px={6} py={4} bg="transparent">
        <HStack justify="space-between">
          <Heading size="md" color="white">
            <HStack>
              <Icon as={FaEye} />
              <Text>Inspect a Player</Text>
            </HStack>
          </Heading>
          {!canInspect && (
            <Badge colorScheme="red" fontSize="sm" borderRadius="full" px={3}>
              Can't inspect while overfishing
            </Badge>
          )}
        </HStack>
      </Box>
      <CardBody>
        {players.length === 0 ? (
          <Box textAlign="center" py={8} color="gray.500">
            <Text>Waiting for other players to join...</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            {players.map((player) => {
              const isSelected = player.id === selectedPlayerId
              return (
                <Box
                  key={player.id}
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={isSelected ? 'accent.400' : 'rgba(12,18,31,0.12)'}
                  bg={isSelected ? 'rgba(91,141,239,0.08)' : 'rgba(255,255,255,0.9)'}
                  cursor={canInspect ? 'pointer' : 'not-allowed'}
                  opacity={canInspect ? 1 : 0.6}
                  transition="all 0.2s"
                  _hover={
                    canInspect
                      ? {
                          borderColor: 'accent.400',
                          transform: 'translateY(-4px)',
                          boxShadow: 'float',
                        }
                      : {}
                  }
                  onClick={() => canInspect && onSelectPlayer(player.id)}
                  position="relative"
                >
                  {isSelected && (
                    <Icon
                      as={FaCheckCircle}
                      position="absolute"
                      top={2}
                      right={2}
                      color="accent.500"
                      boxSize={6}
                    />
                  )}
                  <VStack spacing={3}>
                    <Avatar
                      size="lg"
                      name={player.name}
                      src={player.photo}
                      border="3px"
                      borderColor={isSelected ? 'accent.500' : 'gray.300'}
                    />
                    <VStack spacing={1}>
                      <Text
                        fontWeight="600"
                        fontSize="md"
                        color={isSelected ? 'accent.700' : 'ink.700'}
                        textAlign="center"
                      >
                        {player.name}
                      </Text>
                      {player.message && (
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontStyle="italic"
                          textAlign="center"
                          noOfLines={2}
                        >
                          "{player.message}"
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                </Box>
              )
            })}
          </SimpleGrid>
        )}
      </CardBody>
    </Card>
  )
}
