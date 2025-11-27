'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Card,
  CardBody,
  Heading,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa'

interface Player {
  id: string
  name: string
  photo: string
  fishCount: number
}

interface LeaderboardProps {
  players: Player[]
  currentPlayerId?: string
}

export default function Leaderboard({ players, currentPlayerId }: LeaderboardProps) {
  // Sort players by fish count
  const sortedPlayers = [...players].sort((a, b) => b.fishCount - a.fishCount)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Icon as={FaTrophy} color="yellow.500" boxSize={6} />
      case 1:
        return <Icon as={FaMedal} color="gray.400" boxSize={5} />
      case 2:
        return <Icon as={FaAward} color="orange.600" boxSize={5} />
      default:
        return null
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'yellow.50'
      case 1:
        return 'gray.50'
      case 2:
        return 'orange.50'
      default:
        return 'white'
    }
  }

  return (
    <Card borderRadius="xl" boxShadow="float" overflow="hidden" bg="rgba(255,255,255,0.01)" _dark={{ bg: 'rgba(14,18,28,0.95)' }} border="1px solid rgba(255,255,255,0.1)">
      <Box bgGradient="linear(to-r, accent.500, accent.600)" px={6} py={4} bg="transparent">
        <Heading size="md" color="white">
          Leaderboard
        </Heading>
      </Box>
      <CardBody p={0}>
        <VStack spacing={0} align="stretch">
          {sortedPlayers.map((player, index) => (
            <Box
              key={player.id}
              bg={getRankColor(index)}
              borderBottom={index < sortedPlayers.length - 1 ? '1px' : 'none'}
              borderColor="gray.200"
              transition="all 0.2s"
              //_hover={{ bg: 'rgba(91,141,239,0.08)' }}
            >
              <HStack
                p={4}
                spacing={4}
                bg={player.id === currentPlayerId ? 'rgba(91,141,239,0.1)' : 'transparent'}
                borderLeft={player.id === currentPlayerId ? '4px' : 'none'}
                borderColor="accent.500"
              >
                <Flex w="40px" justify="center" align="center">
                  {getRankIcon(index) || (
                    <Text fontWeight="bold" fontSize="lg" color="gray.500">
                      {index + 1}
                    </Text>
                  )}
                </Flex>

                <Avatar
                  size="md"
                  name={player.name}
                  src={player.photo}
                  border="2px"
                  borderColor={player.id === currentPlayerId ? 'brand.500' : 'gray.200'}
                />

                <Box flex="1">
                  <HStack>
                    <Text fontWeight="600" fontSize="md" color="gray.800">
                      {player.name}
                    </Text>
                    {player.id === currentPlayerId && (
                      <Badge colorScheme="brand" fontSize="xs">
                        You
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Rank #{index + 1}
                  </Text>
                </Box>

                <VStack spacing={0} align="end">
                  <Text fontWeight="bold" fontSize="2xl" color="accent.600" _dark={{ color: 'accent.200' }}>
                    {player.fishCount.toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    Fish
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}
