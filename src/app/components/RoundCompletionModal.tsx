'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Progress,
  Badge,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Divider,
  Heading,
} from '@chakra-ui/react'
import { FaFish, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface RoundCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  roundNumber: number
  totalRounds: number
  lakeFishCount: number
  previousLakeFishCount: number
  myFishCaught: number
  totalMyFish: number
  wasCaughtCheating: boolean
  caughtSomeoneCheating: boolean
  lakeGrowth: number
}

export default function RoundCompletionModal({
  isOpen,
  onClose,
  roundNumber,
  totalRounds,
  lakeFishCount,
  previousLakeFishCount,
  myFishCaught,
  totalMyFish,
  wasCaughtCheating,
  caughtSomeoneCheating,
  lakeGrowth,
}: RoundCompletionModalProps) {
  const progressPercent = (roundNumber / totalRounds) * 100
  const safePrevLake = previousLakeFishCount || 1
  const lakeHealthPercent = Math.max(0, Math.min(100, (lakeFishCount / safePrevLake) * 100))
  const lakeIsGrowing = lakeFishCount >= previousLakeFishCount
  const lakeIsCritical = lakeFishCount < previousLakeFishCount * 0.3
  const isLastRound = roundNumber >= totalRounds

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(12px)" />
      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        bg="rgba(255,255,255,0.9)"
        _dark={{ bg: 'rgba(14,18,28,0.92)' }}
        backdropFilter="blur(18px)"
        border="1px solid"
        borderColor="rgba(12,18,31,0.12)"
        boxShadow="float"
      >
        <ModalHeader
          bgGradient="linear(to-r, accent.500, accent.600)"
          color="white"
          textAlign="center"
          py={6}
          fontSize="2xl"
          fontWeight="bold"
        >
          <VStack spacing={2}>
            <Text>Round {roundNumber} Complete</Text>
            <HStack>
              <Badge colorScheme="whiteAlpha" fontSize="md" px={3} py={1} borderRadius="full">
                Round {roundNumber} / {totalRounds}
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Progress Bar */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="600" color="ink.700" _dark={{ color: 'paper.100' }}>
                  Game Progress
                </Text>
                <Text fontSize="sm" fontWeight="700" color="accent.600" _dark={{ color: 'accent.200' }}>
                  {progressPercent.toFixed(0)}%
                </Text>
              </HStack>
              <Progress value={progressPercent} size="lg" borderRadius="full" colorScheme="accent" bg="rgba(12,18,31,0.08)" />
            </Box>

            <Divider />

            {/* Your Results */}
            <Box>
              <Heading size="sm" mb={4} color="ink.800" _dark={{ color: 'paper.50' }}>
                Your Round Results
              </Heading>
              <SimpleGrid columns={2} spacing={4}>
                <Stat
                  bg={wasCaughtCheating ? 'red.50' : 'accent.50'}
                  _dark={{ bg: wasCaughtCheating ? 'rgba(255,80,80,0.08)' : 'rgba(91,141,239,0.12)' }}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={wasCaughtCheating ? 'rgba(255,80,80,0.3)' : 'rgba(91,141,239,0.25)'}
                  boxShadow="soft"
                >
                  <StatLabel fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                    This Round
                  </StatLabel>
                  <StatNumber fontSize="2xl" color={wasCaughtCheating ? 'red.600' : 'accent.600'} _dark={{ color: wasCaughtCheating ? 'red.300' : 'accent.200' }}>
                    {wasCaughtCheating ? '0' : myFishCaught.toFixed(1)}
                  </StatNumber>
                  <StatHelpText mb={0} fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                    {wasCaughtCheating ? (
                      <HStack spacing={1}>
                        <Icon as={FaExclamationTriangle} color="red.500" />
                        <Text>Caught cheating</Text>
                      </HStack>
                    ) : (
                      'Fish caught'
                    )}
                  </StatHelpText>
                </Stat>

                <Stat
                  bg="paper.50"
                  _dark={{ bg: 'rgba(255,255,255,0.04)' }}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(91,141,239,0.2)"
                  boxShadow="soft"
                >
                  <StatLabel fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                    Total Accumulated
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="accent.600" _dark={{ color: 'accent.200' }}>
                    {totalMyFish.toFixed(1)}
                  </StatNumber>
                  <StatHelpText mb={0} fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                    Your total fish
                  </StatHelpText>
                </Stat>
              </SimpleGrid>

              {caughtSomeoneCheating && (
                <Box
                  mt={3}
                  bg="rgba(224,165,46,0.12)"
                  border="1px solid rgba(224,165,46,0.35)"
                  p={3}
                  borderRadius="lg"
                >
                  <HStack>
                    <Icon as={FaCheckCircle} color="warning.600" boxSize={5} />
                    <Text fontSize="sm" fontWeight="600" color="warning.700" _dark={{ color: 'warning.300' }}>
                      You caught someone overfishing and earned bonus fish.
                    </Text>
                  </HStack>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Lake Status */}
            <Box>
              <Heading size="sm" mb={4} color="ink.800" _dark={{ color: 'paper.50' }}>
                Lake Status
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Icon
                      as={FaFish}
                      color={lakeIsCritical ? 'red.500' : lakeIsGrowing ? 'success.500' : 'warning.500'}
                      boxSize={5}
                    />
                    <Text fontSize="sm" fontWeight="600" color="ink.700" _dark={{ color: 'paper.100' }}>
                      Fish Remaining
                    </Text>
                  </HStack>
                  <Badge
                    borderRadius="full"
                    bg="rgba(255,255,255,0.08)"
                    color={lakeIsCritical ? 'red.600' : lakeIsGrowing ? 'success.600' : 'warning.600'}
                    px={3}
                    py={1}
                    border="1px solid"
                    borderColor="rgba(12,18,31,0.12)"
                  >
                    {lakeFishCount.toFixed(1)}
                  </Badge>
                </HStack>

                <Progress
                  value={lakeHealthPercent}
                  size="sm"
                  borderRadius="full"
                  colorScheme={lakeIsCritical ? 'red' : lakeIsGrowing ? 'green' : 'orange'}
                  bg="rgba(12,18,31,0.08)"
                />

                <HStack justify="space-between" fontSize="sm">
                  <HStack>
                    <Icon as={FaChartLine} color="success.500" />
                    <Text color="ink.500" _dark={{ color: 'ink.300' }}>Natural Growth</Text>
                  </HStack>
                  <Text fontWeight="700" color="success.600" _dark={{ color: 'success.400' }}>
                    +{lakeGrowth.toFixed(1)} fish
                  </Text>
                </HStack>

                {lakeIsCritical && (
                  <Box bg="rgba(255,80,80,0.08)" p={3} borderRadius="lg" border="1px solid rgba(255,80,80,0.3)">
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} />
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontSize="sm" fontWeight="700" color="red.700" _dark={{ color: 'red.300' }}>
                          Lake is in critical condition
                        </Text>
                        <Text fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                          The lake is being overfished. If it depletes, everyone loses.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {lakeIsGrowing && !lakeIsCritical && (
                  <Box bg="rgba(59,170,122,0.08)" p={3} borderRadius="lg" border="1px solid rgba(59,170,122,0.3)">
                    <HStack>
                      <Icon as={FaCheckCircle} color="success.500" boxSize={5} />
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontSize="sm" fontWeight="700" color="success.700" _dark={{ color: 'success.300' }}>
                          Lake is healthy and growing
                        </Text>
                        <Text fontSize="xs" color="ink.500" _dark={{ color: 'ink.300' }}>
                          Sustainable fishing is allowing the lake to recover.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="rgba(12,18,31,0.04)" _dark={{ bg: 'rgba(255,255,255,0.03)' }}>
          <Button
            onClick={onClose}
            variant="primary"
            size="lg"
            width="100%"
            borderRadius="pill"
            fontWeight="700"
          >
            {isLastRound ? 'View final results' : `Continue to Round ${roundNumber + 1}`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
