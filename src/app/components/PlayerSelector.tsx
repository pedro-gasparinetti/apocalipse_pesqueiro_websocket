'use client'

import {
  Box,
  Avatar,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Card,
  CardBody,
  Heading,
  Stack,
} from '@chakra-ui/react'
import { FaEye, FaCheckCircle } from 'react-icons/fa'

interface Player {
  id: string
  name: string
  photo: string
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
    <Card
      borderRadius="xl"
      boxShadow="float"
      overflow="hidden"
      bg="rgba(255,255,255,0.01)"
      _dark={{ bg: 'rgba(14,18,28,0.95)' }}
      border="1px solid rgba(255,255,255,0.1)"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box
        bgGradient="linear(to-r, accent.500, accent.600)"
        px={6}
        py={4}
        bg="transparent"
        position="relative"
        minH="80px"
      >
        <HStack align="center" spacing={3} h="100%">
          <Icon as={FaEye} color="white" />
          <Heading size="md" color="white">
            Inspect a Player
          </Heading>
        </HStack>
        {!canInspect && (
          <Badge
            colorScheme="red"
            fontSize="sm"
            borderRadius="full"
            px={3}
            position="absolute"
            left={6}
            top="66px"
          >
            Can't inspect while overfishing
          </Badge>
        )}
      </Box>
      <CardBody>
        {players.length === 0 ? (
          <Box textAlign="center" py={8} color="gray.500">
            <Text>Waiting for other players to join...</Text>
          </Box>
        ) : (
          <Stack spacing={3}>
            {players.map((player) => {
              const isSelected = player.id === selectedPlayerId
              return (
                <Box
                  key={player.id}
                  p={3}
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
                  w="100%"
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
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={3} align="center">
                      <Avatar
                        size="sm"
                        name={player.name}
                        src={player.photo}
                        border="2px"
                        borderColor={isSelected ? 'accent.500' : 'gray.300'}
                      />
                      <Text
                        fontWeight="600"
                        fontSize="md"
                        color={isSelected ? 'accent.700' : 'ink.700'}
                        noOfLines={1}
                      >
                        {player.name}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )
            })}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
