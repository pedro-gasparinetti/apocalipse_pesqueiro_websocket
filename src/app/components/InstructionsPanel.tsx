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
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl" maxH="90vh">
        <ModalHeader
          bg="brand.500"
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
              <Heading size="md" mb={3} color="brand.700">
                Game Overview
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                This is a multiplayer fishing simulation game that explores the <strong>tragedy of the commons</strong>.
                Your goal is to maximize your fish collection while maintaining the lake's sustainability for all players.
              </Text>
            </Box>

            <Divider />

            {/* Initial Investment */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaCoins} color="earth.500" boxSize={5} />
                <Heading size="md" color="brand.700">
                  Initial Investment
                </Heading>
              </HStack>
              <Box bg="earth.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="earth.500">
                <Text color="gray.700" fontWeight="600">
                  Each player contributes <Badge colorScheme="orange" fontSize="md">{gameState?.quantidadeInicialPeixesJogador || 100} fish</Badge> at the start
                </Text>
                <Text color="gray.600" fontSize="sm" mt={2}>
                  This creates a shared lake resource that can grow over time if managed sustainably
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* How Each Round Works */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaFish} color="lake.500" boxSize={5} />
                <Heading size="md" color="brand.700">
                  Each Round
                </Heading>
              </HStack>
              <List spacing={3}>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaFish} color="lake.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">Choose how many fish to catch</Text>
                    <Text fontSize="sm" color="gray.600">
                      Maximum per round: <Badge>{gameState?.limitePossivelRodada || 20}</Badge> fish
                    </Text>
                  </Box>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaEye} color="brand.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">Optionally inspect another player</Text>
                    <Text fontSize="sm" color="gray.600">
                      Costs <Badge colorScheme="red">{gameState?.custoFiscalizacao || 2}</Badge> fish from your catch
                    </Text>
                  </Box>
                </ListItem>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FaChartLine} color="success.500" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">Lake regenerates naturally</Text>
                    <Text fontSize="sm" color="gray.600">
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
                <Heading size="md" color="brand.700">
                  The Sustainable Limit
                </Heading>
              </HStack>
              <Box bg="danger.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="danger.500">
                <Text color="gray.700" mb={2}>
                  <strong>Catching more than <Badge colorScheme="red" fontSize="md">{gameState?.limiteSustentavel || 11}</Badge> fish per round is considered overfishing</strong>
                </Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  If you overfish AND get inspected:
                </Text>
                <List spacing={2} fontSize="sm" color="gray.700">
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
                <Icon as={FaEye} color="brand.500" boxSize={5} />
                <Heading size="md" color="brand.700">
                  Inspection Strategy
                </Heading>
              </HStack>
              <VStack align="stretch" spacing={3}>
                <Box bg="brand.50" p={3} borderRadius="lg">
                  <Text fontWeight="600" color="gray.800" mb={1}>
                    Can't do both:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    You cannot overfish AND inspect someone in the same round
                  </Text>
                </Box>
                <Box bg="success.50" p={3} borderRadius="lg">
                  <Text fontWeight="600" color="gray.800" mb={1}>
                    Costs to inspect:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Badge colorScheme="red">{gameState?.custoFiscalizacao || 2}</Badge> fish deducted from your catch (goes to bank)
                  </Text>
                </Box>
                <Box bg="lake.50" p={3} borderRadius="lg">
                  <Text fontWeight="600" color="gray.800" mb={1}>
                    Rewards if you catch a cheater:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
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
                <Heading size="md" color="brand.700">
                  Winning Strategy
                </Heading>
              </HStack>
              <VStack align="stretch" spacing={2} bg="success.50" p={4} borderRadius="lg">
                <Text color="gray.700" fontWeight="600">
                  Balance individual gain with collective sustainability:
                </Text>
                <Text fontSize="sm" color="gray.600">
                  If everyone overfishes, the lake depletes and everyone loses
                </Text>
                <Text fontSize="sm" color="gray.600">
                  If everyone fishes sustainably, the lake grows and prosperity increases
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Strategic inspection helps enforce fair play and deter cheaters
                </Text>
              </VStack>
            </Box>

            <Divider />

            {/* Game End */}
            <Box>
              <Heading size="md" mb={3} color="brand.700">
                Game End
              </Heading>
              <Text color="gray.700">
                The game ends after <Badge colorScheme="blue">{gameState?.limiteRodadas || 10}</Badge> rounds
                or when the lake has fewer than <Badge colorScheme="red">1</Badge> fish remaining
              </Text>
              <Text color="gray.600" fontSize="sm" mt={2}>
                The player with the most accumulated fish wins!
              </Text>
            </Box>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
