'use client'

import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  HStack,
  Box,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { FaFish, FaWater, FaCoins, FaChartLine } from 'react-icons/fa'

interface GameStatsProps {
  myFishCount: number
  lakeFishCount: number
  bankTotal: number
  currentRound: number
  totalRounds: number
  growthRate: number
}

export default function GameStats({
  myFishCount,
  lakeFishCount,
  bankTotal,
  currentRound,
  totalRounds,
  growthRate,
}: GameStatsProps) {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
      <Card
        borderRadius="xl"
        boxShadow="md"
        //opacity={0.3}
        bg="transparent "
        border="2px"
        borderColor="brand.30"
      >
        <CardBody>
          <Stat>
            <HStack mb={2}>
              <Icon as={FaFish} boxSize={5} color="brand.600" />
              <StatLabel fontSize="sm" fontWeight="600" color="gray.100">
                My Fish
              </StatLabel>
            </HStack>
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.600">
              {myFishCount.toFixed(1)}
            </StatNumber>
            <StatHelpText color="gray.100" mb={0}>
              Your total catch
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        borderRadius="xl"
        boxShadow="md"
        //opacity={0.3}
        bg="transparent "
        border="2px"
        borderColor="brand.30"
      >
        <CardBody>
          <Stat>
            <HStack mb={2}>
              <Icon as={FaWater} boxSize={5} color="lake.600" />
              <StatLabel fontSize="sm" fontWeight="600" color="gray.100">
                Lake Stock
              </StatLabel>
            </HStack>
            <StatNumber fontSize="3xl" fontWeight="bold" color="lake.600">
              {lakeFishCount.toFixed(1)}
            </StatNumber>
            <StatHelpText color="gray.100" mb={0}>
              Available fish
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        borderRadius="xl"
        boxShadow="md"
        //opacity={0.3}
        bg="transparent "
        border="2px"
        borderColor="brand.30"
      >
        <CardBody>
          <Stat>
            <HStack mb={2}>
              <Icon as={FaCoins} boxSize={5} color="orange.200" />
              <StatLabel fontSize="sm" fontWeight="600" color="gray.100">
                Bank Total
              </StatLabel>
            </HStack>
            <StatNumber fontSize="3xl" fontWeight="bold" color="orange.200">
              {bankTotal.toFixed(1)}
            </StatNumber>
            <StatHelpText color="gray.100" mb={0}>
              Lost to fees
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        borderRadius="xl"
        boxShadow="md"
        //opacity={0.3}
        bg="transparent "
        border="2px"
        borderColor="brand.30"
      >
        <CardBody>
          <Stat>
            <HStack mb={2}>
              <Icon as={FaChartLine} boxSize={5} color="success.600" />
              <StatLabel fontSize="sm" fontWeight="600" color="gray.100">
                Round
              </StatLabel>
            </HStack>
            <StatNumber fontSize="3xl" fontWeight="bold" color="success.600">
              {currentRound} / {totalRounds}
            </StatNumber>
            <StatHelpText color="gray.100" mb={0}>
              Growth: {(growthRate * 100).toFixed(0)}%
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  )
}
