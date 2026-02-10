'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Box,
  Heading,
  List,
  ListItem,
  ListIcon,
  Divider,
  Badge,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { FaFish, FaEye, FaCoins, FaExclamationTriangle, FaChartLine, FaUsers } from 'react-icons/fa'

interface InstructionsPanelProps {
  isOpen: boolean
  onClose: () => void
  gameState: any
}

export default function InstructionsPanel({ isOpen, onClose, gameState }: InstructionsPanelProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(12px)" />
      <ModalContent
        borderRadius="2xl"
        maxH="90vh"
        bg="rgba(255,255,255,0.94)"
        _dark={{ bg: 'rgba(14,18,28,0.96)' }}
        border="1px solid"
        borderColor="rgba(12,18,31,0.12)"
        boxShadow="float"
        backdropFilter="blur(18px)"
      >
        <ModalHeader
          bgGradient="linear(to-r, accent.500, accent.600)"
          color="white"
          borderTopRadius="2xl"
          fontSize="2xl"
          fontWeight="700"
        >
          How to Play - Common Pool Resource Game
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">

            {/* Game Overview */}
            <Box>
              <Heading size="md" mb={3} color="ink.800" _dark={{ color: 'paper.50' }}>
                Game Overview
              </Heading>
              <Text color="ink.600" _dark={{ color: 'ink.300' }} lineHeight="tall">
                This is a multiplayer fishing simulation game that explores the <strong>tragedy of the commons</strong>.
                Your goal is to maximize your fish collection while maintaining the lake's sustainability for all players.
              </Text>
            </Box>

            <Divider />

            {/* Initial Investment */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaCoins} color="accent.500" boxSize={5} />
                <Heading size="md" color="ink.800" _dark={{ color: 'paper.50' }}>
                  Initial Investment
                </Heading>
              </HStack>
              <Box bg="rgba(91,141,239,0.08)" _dark={{ bg: 'rgba(91,141,239,0.12)' }} p={4} borderRadius="lg" border="1px solid rgba(91,141,239,0.18)">
                <Text color="ink.700" _dark={{ color: 'paper.100' }} fontWeight="600">
                  Each player contributes <Badge colorScheme="accent" variant="solid" fontSize="md">{gameState?.quantidadeInicialPeixesJogador || 100} fish</Badge> at the start
                </Text>
                <Text color="ink.500" _dark={{ color: 'ink.300' }} fontSize="sm" mt={2}>
                  This creates a shared lake resource that can grow over time if managed sustainably
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* How Each Round Works */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaFish} color="accent.500" boxSize={5} />
                <Heading size="md" color="ink.800" _dark={{ color: 'paper.50' }}>
                  Each Round
                </Heading>
              </HStack>
              <List spacing={3}>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaFish} color="accent.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }}>Choose how many fish to catch</Text>
                    <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                      Maximum per round: <Badge>{gameState?.limitePossivelRodada || 20}</Badge> fish
                    </Text>
                  </Box>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaEye} color="accent.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }}>Optionally inspect another player</Text>
                    <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                      Costs <Badge colorScheme="red">{gameState?.custoFiscalizacao || 2}</Badge> fish from your catch
                    </Text>
                  </Box>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaChartLine} color="success.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }}>Lake regenerates naturally</Text>
                    <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                      Growth rate: <Badge colorScheme="green">{((gameState?.taxaCrescimento || 0.02) * 100).toFixed(0)}%</Badge> per round
                    </Text>
                  </Box>
                </ListItem>
              </List>
            </Box>

            <Divider />

            {/* Sustainable Limit */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaExclamationTriangle} color="danger.500" boxSize={5} />
                <Heading size="md" color="ink.800" _dark={{ color: 'paper.50' }}>
                  The Sustainable Limit
                </Heading>
              </HStack>
              <Box bg="rgba(255,93,93,0.08)" _dark={{ bg: 'rgba(255,93,93,0.1)' }} p={4} borderRadius="lg" border="1px solid rgba(255,93,93,0.25)">
                <Text color="ink.700" _dark={{ color: 'paper.100' }} mb={2}>
                  <strong>Catching more than <Badge colorScheme="red" fontSize="md">{gameState?.limiteSustentavel || 11}</Badge> fish per round is considered overfishing</strong>
                </Text>
                <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }} mb={3}>
                  If you overfish AND get inspected:
                </Text>
                <List spacing={2} fontSize="sm" color="ink.700" _dark={{ color: 'paper.100' }}>
                  <ListItem ml={4}>
                    <Badge colorScheme="red" mr={2}>10%</Badge> of your catch goes to the bank (lost forever)
                  </ListItem>
                  <ListItem ml={4}>
                    <Badge colorScheme="orange" mr={2}>90%</Badge> is split among players who inspected you
                  </ListItem>
                  <ListItem ml={4}>
                    You keep <Badge colorScheme="red" mr={2}>NOTHING</Badge> from that round
                  </ListItem>
                </List>
              </Box>
            </Box>

            <Divider />

            {/* Inspection Strategy */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaEye} color="accent.500" boxSize={5} />
                <Heading size="md" color="ink.800" _dark={{ color: 'paper.50' }}>
                  Inspection Strategy
                </Heading>
              </HStack>
              <VStack align="stretch" spacing={3}>
                <Box bg="rgba(91,141,239,0.08)" _dark={{ bg: 'rgba(91,141,239,0.12)' }} p={3} borderRadius="lg" border="1px solid rgba(91,141,239,0.18)">
                  <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }} mb={1}>
                    Can't do both:
                  </Text>
                  <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                    You cannot overfish AND inspect someone in the same round
                  </Text>
                </Box>
                <Box bg="rgba(59,170,122,0.08)" _dark={{ bg: 'rgba(59,170,122,0.12)' }} p={3} borderRadius="lg" border="1px solid rgba(59,170,122,0.2)">
                  <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }} mb={1}>
                    Costs to inspect:
                  </Text>
                  <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                    <Badge colorScheme="red">{gameState?.custoFiscalizacao || 2}</Badge> fish deducted from your catch (goes to bank)
                  </Text>
                </Box>
                <Box bg="rgba(12,18,31,0.06)" _dark={{ bg: 'rgba(255,255,255,0.04)' }} p={3} borderRadius="lg" border="1px solid rgba(12,18,31,0.1)">
                  <Text fontWeight="600" color="ink.800" _dark={{ color: 'paper.100' }} mb={1}>
                    Rewards if you catch a cheater:
                  </Text>
                  <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                    Share 90% of the overfisher's catch with other inspectors
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Divider />

            {/* Winning Strategy */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaUsers} color="success.500" boxSize={5} />
                <Heading size="md" color="ink.800" _dark={{ color: 'paper.50' }}>
                  Winning Strategy
                </Heading>
              </HStack>
              <VStack align="stretch" spacing={2} bg="rgba(59,170,122,0.08)" _dark={{ bg: 'rgba(59,170,122,0.12)' }} p={4} borderRadius="lg" border="1px solid rgba(59,170,122,0.2)">
                <Text color="ink.700" _dark={{ color: 'paper.100' }} fontWeight="600">
                  Balance individual gain with collective sustainability:
                </Text>
                <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                  If everyone overfishes, the lake depletes and everyone loses
                </Text>
                <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                  If everyone fishes sustainably, the lake grows and prosperity increases
                </Text>
                <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                  Strategic inspection helps enforce fair play and deter cheaters
                </Text>
              </VStack>
            </Box>

            <Divider />

            {/* Game End */}
            <Box>
              <Heading size="md" mb={3} color="ink.800" _dark={{ color: 'paper.50' }}>
                Game End
              </Heading>
              <Text color="ink.700" _dark={{ color: 'paper.100' }}>
                The game ends after <Badge colorScheme="blue">{gameState?.limiteRodadas || 10}</Badge> rounds
                or when the lake has fewer than <Badge colorScheme="red">1</Badge> fish remaining
              </Text>
              <Text color="ink.500" _dark={{ color: 'ink.300' }} fontSize="sm" mt={2}>
                The player with the most accumulated fish wins!
              </Text>
            </Box>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
