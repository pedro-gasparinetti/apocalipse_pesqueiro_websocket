'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Icon,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiArrowRight, FiSearch, FiLock, FiBarChart2, FiLayout } from 'react-icons/fi'
import NavBar from './components/NavBar'
import LakeScene from './components/LakeScene'

const MotionBox = (motion as any).create ? (motion as any).create(Box) : motion(Box)

export default function LandingPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cardBg = useColorModeValue('paper.50', 'paper.900')

  return (
    <Box minH="100vh" pb={12}>
      <NavBar />
      <Container maxW="6xl" px={{ base: 4, md: 6 }} pt={{ base: 10, md: 16 }}>
        <MotionBox
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          mb={12}
        >
          <VStack align="flex-start" spacing={6}>
            <Badge colorScheme="accent" borderRadius="full" px={3} py={1} bg="accent.50" color="accent.700" _dark={{ bg: 'rgba(91,141,239,0.2)', color: 'accent.100' }}>
              Calm luxury interface
            </Badge>
            <Heading fontSize={{ base: '3xl', md: '4xl' }} letterSpacing="-0.03em">
              A serene command center for your commons simulation.
            </Heading>
            <Text fontSize="lg" maxW="2xl" color="ink.500" _dark={{ color: 'ink.300' }}>
              Precision typography, generous whitespace, glass panels, and soft motion. Built to keep the focus on decisions, not UI chrome.
            </Text>
            <HStack spacing={3} wrap="wrap">
              <Button as={Link} href="/dashboard" size="lg" rightIcon={<FiArrowRight />}>
                Enter dashboard
              </Button>
              <Button as={Link} href="/settings" variant="secondary" size="lg">
                Personalize
              </Button>
              <Button variant="ghost" onClick={onOpen} size="lg">
                View quick primer
              </Button>
            </HStack>
            <InputGroup maxW="420px" mt={2}>
              <InputLeftElement pointerEvents="none">
                <FiSearch />
              </InputLeftElement>
              <Input placeholder="Search policy notes or sessions" />
            </InputGroup>
          </VStack>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          {[
            { icon: FiLayout, title: 'Glass panels', desc: 'Hairline borders, frosted blur, and soft shadow lift.' },
            { icon: FiBarChart2, title: 'Precision metrics', desc: 'Compact stats with confident headings and calm spacing.' },
            { icon: FiLock, title: 'Focus & control', desc: 'Accessible focus rings, keyboard-ready actions, 180ms easing.' },
          ].map((item) => (
            <Card key={item.title} bg={cardBg}>
              <CardBody as={HStack} spacing={4}>
                <Icon as={item.icon} boxSize={5} color="accent.500" />
                <VStack align="flex-start" spacing={1}>
                  <Text fontWeight={700}>{item.title}</Text>
                  <Text color="ink.500" _dark={{ color: 'ink.300' }} fontSize="sm">
                    {item.desc}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Card className="glass-panel" overflow="hidden">
          <CardBody>
            <HStack justify="space-between" align="flex-start" mb={4} flexWrap="wrap" spacing={4}>
              <VStack align="flex-start" spacing={2}>
                <Text fontSize="lg" fontWeight={700}>Live lake preview</Text>
                <Text color="ink.500" _dark={{ color: 'ink.300' }}>
                  Boats and fish rendered as soft squares with motion trails.
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Badge colorScheme="accent" borderRadius="full">Viewport</Badge>
                <Badge variant="outline" borderColor="rgba(12,18,31,0.12)" _dark={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                  PixiJS
                </Badge>
              </HStack>
            </HStack>
            <LakeScene fishCount={48} playerCount={4} currentRound={2} isGameActive height="420px" />
          </CardBody>
        </Card>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Design intent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={3}>Calm luxury means:</Text>
            <Text>- One accent color, hairline dividers, and soft gradients.</Text>
            <Text>- Glass surfaces with blur, restrained shadows, 180-200ms easing.</Text>
            <Text>- Confident typography with tight letter spacing and generous whitespace.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
