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
    <Card borderRadius="xl" boxShadow="md" overflow="hidden">
      <Box bg="brand.500" px={6} py={4}>
        <HStack justify="space-between">
          <Heading size="md" color="white">
            <HStack>
              <Icon as={FaEye} />
              <Text>Inspect a Player</Text>
            </HStack>
          </Heading>
          {!canInspect && (
            <Badge colorScheme="red" fontSize="sm">
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
                  border="2px"
                  borderColor={isSelected ? 'brand.500' : 'gray.200'}
                  bg={isSelected ? 'brand.50' : 'white'}
                  cursor={canInspect ? 'pointer' : 'not-allowed'}
                  opacity={canInspect ? 1 : 0.6}
                  transition="all 0.2s"
                  _hover={
                    canInspect
                      ? {
                          borderColor: 'brand.400',
                          transform: 'translateY(-4px)',
                          boxShadow: 'lg',
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
                      color="brand.500"
                      boxSize={6}
                    />
                  )}
                  <VStack spacing={3}>
                    <Avatar
                      size="lg"
                      name={player.name}
                      src={player.photo}
                      border="3px"
                      borderColor={isSelected ? 'brand.500' : 'gray.300'}
                    />
                    <VStack spacing={1}>
                      <Text
                        fontWeight="600"
                        fontSize="md"
                        color={isSelected ? 'brand.700' : 'gray.800'}
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
