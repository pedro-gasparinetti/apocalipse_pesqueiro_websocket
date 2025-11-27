'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  Badge,
  Button,
  Divider,
  VStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FiBarChart2, FiShield, FiActivity } from 'react-icons/fi'
import NavBar from '../components/NavBar'
import LakeScene from '../components/LakeScene'

const GameRoom = dynamic(() => import('../components/GameRoom'), { ssr: false })

const MotionBox = (motion as any).create ? (motion as any).create(Box) : motion(Box)

export default function DashboardPage() {
  const cardBg = useColorModeValue('paper.50', 'paper.900')
  return (
    <Box minH="100vh" pb={12}>
      <NavBar />
      <Container maxW="6xl" px={{ base: 4, md: 6 }} pt={{ base: 8, md: 12 }}>
        <HStack justify="space-between" align="flex-start" mb={6} spacing={4} flexWrap="wrap">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg">Dashboard</Heading>
            <Text color="ink.500" _dark={{ color: 'ink.300' }}>
              Run the simulation, monitor the lake, and review insights.
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button as={Link} href="/settings" variant="secondary" size="sm">
              Settings
            </Button>
            <Button size="sm" rightIcon={<FiActivity />} as={Link} href="/dashboard">
              New session
            </Button>
          </HStack>
        </HStack>

        <Tabs defaultIndex={0}>
          <TabList>
            <Tab>Simulation</Tab>
            <Tab>Insights</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} pt={6}>
              <MotionBox initial={{ opacity: 0.92, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <GameRoom />
              </MotionBox>
            </TabPanel>
            <TabPanel px={0} pt={6}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
                {[
                  { icon: FiBarChart2, title: 'Catch trend', value: '+12.5%', note: 'vs. previous round' },
                  { icon: FiShield, title: 'Compliance', value: '92%', note: 'inspections resolved' },
                  { icon: FiActivity, title: 'Lake health', value: 'Stable', note: 'above sustainable threshold' },
                ].map((card) => (
                  <Card key={card.title} bg={cardBg}>
                    <CardBody as={HStack} spacing={4}>
                      <Badge borderRadius="lg" px={2.5} py={1} bg="accent.50" color="accent.700" _dark={{ bg: 'rgba(91,141,239,0.16)', color: 'accent.100' }}>
                        <Icon as={card.icon} />
                      </Badge>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight={700}>{card.title}</Text>
                        <Text fontSize="xl" fontWeight={700}>{card.value}</Text>
                        <Text color="ink.500" _dark={{ color: 'ink.300' }} fontSize="sm">{card.note}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>

              <Card className="glass-panel">
                <CardBody>
                  <HStack justify="space-between" align="flex-start" mb={3} spacing={4}>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight={700}>Trajectory canvas</Text>
                      <Text color="ink.500" _dark={{ color: 'ink.300' }} fontSize="sm">
                        Full-width Pixi scene with trails and smooth motion.
                      </Text>
                    </VStack>
                    <Badge variant="outline" borderColor="rgba(12,18,31,0.12)" _dark={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                      Analytics view
                    </Badge>
                  </HStack>
                  <LakeScene fishCount={120} playerCount={6} currentRound={4} isGameActive height="520px" />
                  <Divider my={4} />
                  <Text fontSize="sm" color="ink.500" _dark={{ color: 'ink.300' }}>
                    Use this view for presenters; the main Simulation tab remains fully interactive through the existing backend.
                  </Text>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  )
}
