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
  const lakeHealthPercent = Math.max(0, Math.min(100, (lakeFishCount / previousLakeFishCount) * 100))
  const lakeIsGrowing = lakeFishCount >= previousLakeFishCount
  const lakeIsCritical = lakeFishCount < previousLakeFishCount * 0.3

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader
          bg="brand.500"
          color="white"
          textAlign="center"
          py={6}
          fontSize="2xl"
          fontWeight="bold"
        >
          <VStack spacing={2}>
            <Text>Round {roundNumber} Complete!</Text>
            <HStack>
              <Badge colorScheme="whiteAlpha" fontSize="md" px={3} py={1}>
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
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  Game Progress
                </Text>
                <Text fontSize="sm" fontWeight="600" color="brand.600">
                  {progressPercent.toFixed(0)}%
                </Text>
              </HStack>
              <Progress
                value={progressPercent}
                size="lg"
                borderRadius="full"
                colorScheme="brand"
                bg="gray.200"
              />
            </Box>

            <Divider />

            {/* Your Results */}
            <Box>
              <Heading size="sm" mb={4} color="gray.800">
                Your Round Results
              </Heading>
              <SimpleGrid columns={2} spacing={4}>
                <Stat
                  bg={wasCaughtCheating ? 'red.50' : 'green.50'}
                  p={4}
                  borderRadius="lg"
                  border="2px"
                  borderColor={wasCaughtCheating ? 'red.200' : 'green.200'}
                >
                  <StatLabel fontSize="xs" color="gray.600">
                    This Round
                  </StatLabel>
                  <StatNumber fontSize="2xl" color={wasCaughtCheating ? 'red.600' : 'green.600'}>
                    {wasCaughtCheating ? '0' : myFishCaught.toFixed(1)}
                  </StatNumber>
                  <StatHelpText mb={0} fontSize="xs">
                    {wasCaughtCheating ? (
                      <HStack spacing={1}>
                        <Icon as={FaExclamationTriangle} color="red.500" />
                        <Text>Caught cheating!</Text>
                      </HStack>
                    ) : (
                      'Fish caught'
                    )}
                  </StatHelpText>
                </Stat>

                <Stat bg="brand.50" p={4} borderRadius="lg" border="2px" borderColor="brand.200">
                  <StatLabel fontSize="xs" color="gray.600">
                    Total Accumulated
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="brand.600">
                    {totalMyFish.toFixed(1)}
                  </StatNumber>
                  <StatHelpText mb={0} fontSize="xs">
                    Your total fish
                  </StatHelpText>
                </Stat>
              </SimpleGrid>

              {caughtSomeoneCheating && (
                <Box mt={3} bg="yellow.50" p={3} borderRadius="lg" border="2px" borderColor="yellow.300">
                  <HStack>
                    <Icon as={FaCheckCircle} color="yellow.600" boxSize={5} />
                    <Text fontSize="sm" fontWeight="600" color="yellow.800">
                      You caught someone overfishing and earned bonus fish!
                    </Text>
                  </HStack>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Lake Status */}
            <Box>
              <Heading size="sm" mb={4} color="gray.800">
                Lake Status
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Icon
                      as={FaFish}
                      color={lakeIsCritical ? 'red.500' : lakeIsGrowing ? 'green.500' : 'orange.500'}
                      boxSize={5}
                    />
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      Fish Remaining
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme={lakeIsCritical ? 'red' : lakeIsGrowing ? 'green' : 'orange'}
                    fontSize="lg"
                    px={3}
                    py={1}
                  >
                    {lakeFishCount.toFixed(1)}
                  </Badge>
                </HStack>

                <Progress
                  value={lakeHealthPercent}
                  size="sm"
                  borderRadius="full"
                  colorScheme={lakeIsCritical ? 'red' : lakeIsGrowing ? 'green' : 'orange'}
                />

                <HStack justify="space-between" fontSize="sm">
                  <HStack>
                    <Icon as={FaChartLine} color="green.500" />
                    <Text color="gray.600">Natural Growth:</Text>
                  </HStack>
                  <Text fontWeight="600" color="green.600">
                    +{lakeGrowth.toFixed(1)} fish
                  </Text>
                </HStack>

                {lakeIsCritical && (
                  <Box bg="red.50" p={3} borderRadius="lg" border="2px" borderColor="red.200">
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} />
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontSize="sm" fontWeight="700" color="red.800">
                          Lake is in critical condition!
                        </Text>
                        <Text fontSize="xs" color="red.600">
                          The lake is being overfished. If it depletes, everyone loses!
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {lakeIsGrowing && !lakeIsCritical && (
                  <Box bg="green.50" p={3} borderRadius="lg" border="2px" borderColor="green.200">
                    <HStack>
                      <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontSize="sm" fontWeight="700" color="green.800">
                          Lake is healthy and growing!
                        </Text>
                        <Text fontSize="xs" color="green.600">
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

        <ModalFooter bg="gray.50">
          <Button
            onClick={onClose}
            colorScheme="brand"
            size="lg"
            width="100%"
            borderRadius="lg"
            fontWeight="bold"
          >
            Continue to Round {roundNumber + 1}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
