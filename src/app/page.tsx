'use client'

import NextLink from 'next/link'
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
  Badge,
  Icon,
  Flex,
} from '@chakra-ui/react'
import {
  FiArrowRight,
  FiAlertTriangle,
  FiClock,
  FiDroplet,
  FiDollarSign,
  FiAward,
  FiZap,
} from 'react-icons/fi'

const MotionBox = (motion as any).create ? (motion as any).create(Box) : motion(Box)

const badgeBase = {
  borderRadius: 'full',
  px: 3,
  py: 1,
  fontSize: 'xs',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: '1px solid',
}

const badgeStyles = {
  entry: {
    bg: 'rgba(226, 232, 240, 0.08)',
    color: 'whiteAlpha.800',
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  risk: {
    bg: 'rgba(251, 191, 36, 0.16)',
    color: 'warning.200',
    borderColor: 'rgba(251, 191, 36, 0.42)',
  },
  riskHigh: {
    bg: 'rgba(248, 113, 113, 0.18)',
    color: 'danger.100',
    borderColor: 'rgba(248, 113, 113, 0.48)',
  },
  jackpot: {
    bg: 'rgba(251, 191, 36, 0.22)',
    color: 'warning.100',
    borderColor: 'rgba(251, 191, 36, 0.6)',
  },
  cadence: {
    bg: 'rgba(56, 189, 248, 0.16)',
    color: 'cyan.200',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
}

const cardStyle = {
  bg: 'rgba(8, 20, 28, 0.76)',
  border: '1px solid',
  borderColor: 'rgba(94, 135, 150, 0.25)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 18px 40px rgba(3, 10, 15, 0.4)',
  transition: 'all 0.22s ease',
  _hover: {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(120, 200, 220, 0.55)',
    boxShadow: '0 22px 60px rgba(3, 10, 15, 0.55)',
  },
}

const primaryButtonProps = {
  bg: 'warning.400',
  color: 'gray.900',
  _hover: {
    bg: 'warning.300',
    transform: 'translateY(-1px)',
    boxShadow: '0 18px 35px rgba(5, 12, 20, 0.45)',
  },
  _active: {
    bg: 'warning.500',
    transform: 'translateY(0)',
  },
}

const secondaryButtonProps = {
  variant: 'outline',
  borderColor: 'rgba(226, 232, 240, 0.35)',
  color: 'whiteAlpha.900',
  _hover: { bg: 'rgba(255, 255, 255, 0.06)', transform: 'translateY(-1px)' },
  _active: { transform: 'translateY(0)' },
}

const sectionMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
  viewport: { once: true, amount: 0.2 },
}

const axes = [
  {
    title: 'Risco / Retorno',
    icon: FiAlertTriangle,
    description: 'A volatilidade define o tamanho da maré: estabilidade, caos ou prêmio acumulado.',
    items: [
      { title: 'Conservador', desc: 'Risco limitado para leitura estratégica.', badge: '±10%', tone: 'risk' },
      { title: 'Agressivo', desc: 'Dobra ou zera. Sem margem para erro.', badge: '±100%', tone: 'riskHigh' },
      { title: 'Jackpot', desc: 'Prêmio cresce conforme o ecossistema reage.', badge: 'Jackpot', tone: 'jackpot' },
    ],
  },
  {
    title: 'Cadência',
    icon: FiClock,
    description: 'O tempo de decisão muda o ritmo da disputa entre os barcos.',
    items: [
      { title: 'Blitz', desc: 'Decisões rápidas, pressão constante.', badge: '1/min', tone: 'cadence' },
      { title: 'Diário', desc: 'Gestão e impacto acumulado ao longo do dia.', badge: '1/dia', tone: 'cadence' },
    ],
  },
  {
    title: 'Entrada',
    icon: FiDollarSign,
    description: 'Escolha o nível de compromisso e o tamanho do risco financeiro.',
    items: [
      { title: 'Grátis', desc: 'Treino e casual.', badge: 'Grátis', tone: 'entry' },
      { title: 'US$1', desc: 'Competitivo acessível.', badge: 'US$1', tone: 'entry' },
      { title: 'US$1000', desc: 'High stakes, só para quem aguenta a pressão.', badge: 'US$1000', tone: 'entry' },
    ],
  },
]

const presets = [
  {
    name: 'Casual Blitz',
    description: 'Para aprender o ciclo do lago sem custo.',
    badges: [
      { label: 'Grátis', tone: 'entry' },
      { label: '±10%', tone: 'risk' },
      { label: '1/min', tone: 'cadence' },
    ],
    href: '/play/casual-blitz',
    ctaTone: 'primary',
  },
  {
    name: 'Ranked Blitz',
    description: 'Competição rápida com risco controlado.',
    badges: [
      { label: 'US$1', tone: 'entry' },
      { label: '±10%', tone: 'risk' },
      { label: '1/min', tone: 'cadence' },
    ],
    href: '/play/ranked-blitz',
    ctaTone: 'primary',
  },
  {
    name: 'High Roller Blitz',
    description: 'Para quem busca adrenalina e impacto máximo.',
    badges: [
      { label: 'US$1000', tone: 'entry' },
      { label: '±100%', tone: 'riskHigh' },
      { label: '1/min', tone: 'cadence' },
    ],
    href: '/play/high-roller-blitz',
    ctaTone: 'destructive',
  },
  {
    name: 'Liga Diária',
    description: 'Ritmo diário para estratégia de longo prazo.',
    badges: [
      { label: 'US$1', tone: 'entry' },
      { label: '±10%', tone: 'risk' },
      { label: '1/dia', tone: 'cadence' },
    ],
    href: '/play/liga-diaria',
    ctaTone: 'primary',
  },
  {
    name: 'Temporada Diária Jackpot',
    description: 'Acumule prêmio enquanto o ecossistema oscila.',
    badges: [
      { label: 'US$1', tone: 'entry' },
      { label: 'Jackpot', tone: 'jackpot' },
      { label: '1/dia', tone: 'cadence' },
    ],
    href: '/play/temporada-diaria-jackpot',
    ctaTone: 'primary',
  },
  {
    name: 'Evento Especial — Jackpot Relâmpago',
    description: 'Janela curta, risco alto e chance de prêmio explosivo.',
    badges: [
      { label: 'US$1 / US$1000', tone: 'entry' },
      { label: '±100% + Jackpot', tone: 'riskHigh' },
      { label: '1/min', tone: 'cadence' },
    ],
    href: '/play/jackpot-relampago',
    ctaTone: 'destructive',
  },
]

export default function LandingPage() {
  return (
    <Box
      minH="100vh"
      color="whiteAlpha.900"
      position="relative"
      overflow="hidden"
      bg="#050B11"
      sx={{
        backgroundImage:
          'radial-gradient(circle at 12% 18%, rgba(32, 74, 88, 0.55), transparent 38%), radial-gradient(circle at 86% 8%, rgba(40, 95, 68, 0.4), transparent 35%), linear-gradient(160deg, rgba(5, 11, 17, 0.98), rgba(3, 10, 14, 0.98))',
      }}
    >
      <Box
        position="absolute"
        top="-220px"
        left="-160px"
        w="520px"
        h="520px"
        bg="radial-gradient(circle, rgba(56, 189, 248, 0.28), transparent 70%)"
        opacity={0.8}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-240px"
        right="-120px"
        w="540px"
        h="540px"
        bg="radial-gradient(circle, rgba(251, 191, 36, 0.22), transparent 72%)"
        opacity={0.8}
        pointerEvents="none"
      />

      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={20}
        backdropFilter="blur(18px)"
        bg="rgba(5, 11, 16, 0.78)"
        borderBottom="1px solid"
        borderColor="rgba(148, 163, 184, 0.18)"
      >
        <Container maxW="6xl" px={{ base: 4, md: 6 }} py={4}>
          <Flex
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 3, md: 8 }}
          >
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                borderRadius="lg"
                bg="rgba(56, 189, 248, 0.14)"
                border="1px solid rgba(56, 189, 248, 0.35)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiDroplet} color="cyan.200" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="sm" color="cyan.200" letterSpacing="0.2em" textTransform="uppercase">
                  Simulação
                </Text>
                <Text fontSize="lg" fontWeight={700} letterSpacing="-0.02em">
                  Apocalipse Pesqueiro
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3} flexWrap="wrap">
              <Button
                as="a"
                href="#modalidades"
                variant="ghost"
                size="sm"
                color="whiteAlpha.800"
                _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
              >
                Modalidades
              </Button>
              <Button
                as="a"
                href="#presets"
                variant="ghost"
                size="sm"
                color="whiteAlpha.800"
                _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
              >
                Modos prontos
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container
        maxW="6xl"
        px={{ base: 4, md: 6 }}
        pt={{ base: 12, md: 16 }}
        pb={{ base: 12, md: 18 }}
        position="relative"
        zIndex={1}
      >
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <VStack align="flex-start" spacing={6} maxW="3xl">
            <Heading fontSize={{ base: '3xl', md: '5xl' }} letterSpacing="-0.03em">
              Apocalipse Pesqueiro
            </Heading>
            <Text fontSize={{ base: 'md', md: 'xl' }} color="whiteAlpha.700">
              Uma simulação da Tragédia dos Comuns em partidas rápidas ou diárias.
            </Text>
            <Flex gap={3} flexWrap="wrap">
              <Button
                as="a"
                href="/dashboard"
                size="lg"
                rightIcon={<FiArrowRight />}
                {...primaryButtonProps}
              >
                Entrar em uma partida
              </Button>
              <Button
                as={NextLink}
                href="#modalidades"
                size="lg"
                {...secondaryButtonProps}
              >
                Ver modalidades
              </Button>
            </Flex>
            <Box
              px={4}
              py={3}
              borderRadius="lg"
              bg="rgba(8, 20, 28, 0.72)"
              border="1px solid rgba(94, 135, 150, 0.25)"
            >
              <Text fontSize="sm" color="whiteAlpha.700">
                Como funciona: decisões simultâneas drenam ou recuperam o estoque do lago.
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                Quanto maior o impacto coletivo, maior o prêmio — ou o colapso.
              </Text>
            </Box>
          </VStack>
        </MotionBox>

        <Box
          h="1px"
          bgGradient="linear(to-r, rgba(14, 116, 144, 0), rgba(34, 211, 238, 0.45), rgba(251, 191, 36, 0.45), rgba(14, 116, 144, 0))"
          my={{ base: 12, md: 16 }}
        />

        <MotionBox as="section" id="modalidades" scrollMarginTop="120px" {...sectionMotion}>
          <VStack align="flex-start" spacing={4} maxW="2xl">
            <HStack spacing={2} color="cyan.200">
              <Icon as={FiZap} boxSize={5} />
              <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase">
                Modalidades do jogo
              </Text>
            </HStack>
            <Heading fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="-0.02em">
              Três eixos definem sua estratégia
            </Heading>
            <Text color="whiteAlpha.700">
              Combine risco, cadência e entrada para dominar o ecossistema antes que ele colapse.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={8}>
            {axes.map((axis) => (
              <Card key={axis.title} {...cardStyle}>
                <CardBody>
                  <HStack spacing={3} mb={4} align="flex-start">
                    <Box
                      w={10}
                      h={10}
                      borderRadius="lg"
                      bg="rgba(56, 189, 248, 0.12)"
                      border="1px solid rgba(56, 189, 248, 0.3)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={axis.icon} color="cyan.200" />
                    </Box>
                    <Box>
                      <Text fontWeight={700} fontSize="lg">
                        {axis.title}
                      </Text>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        {axis.description}
                      </Text>
                    </Box>
                  </HStack>
                  <VStack align="stretch" spacing={4} mt={6}>
                    {axis.items.map((item) => (
                      <HStack key={item.title} align="flex-start" spacing={3}>
                        <Badge {...badgeBase} {...(badgeStyles as any)[item.tone]}>
                          {item.badge}
                        </Badge>
                        <Box>
                          <Text fontWeight={600}>{item.title}</Text>
                          <Text fontSize="sm" color="whiteAlpha.700">
                            {item.desc}
                          </Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </MotionBox>

        <Box
          h="1px"
          bgGradient="linear(to-r, rgba(14, 116, 144, 0), rgba(34, 211, 238, 0.45), rgba(251, 191, 36, 0.45), rgba(14, 116, 144, 0))"
          my={{ base: 12, md: 16 }}
        />

        <MotionBox as="section" id="presets" scrollMarginTop="120px" {...sectionMotion}>
          <VStack align="flex-start" spacing={4} maxW="2xl">
            <HStack spacing={2} color="warning.200">
              <Icon as={FiAward} boxSize={5} />
              <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase">
                Modos prontos
              </Text>
            </HStack>
            <Heading fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="-0.02em">
              Escolha um preset e entre direto na disputa
            </Heading>
            <Text color="whiteAlpha.700">
              Cada modo já combina entrada, risco e cadência para diferentes perfis de jogador.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={8}>
            {presets.map((preset) => {
              const isDestructive = preset.ctaTone === 'destructive'
              return (
                <Card key={preset.name} {...cardStyle}>
                  <CardBody>
                    <VStack align="flex-start" spacing={3}>
                      <Heading fontSize="xl">{preset.name}</Heading>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        {preset.description}
                      </Text>
                      <Flex gap={2} flexWrap="wrap">
                        {preset.badges.map((badge) => (
                          <Badge key={badge.label} {...badgeBase} {...(badgeStyles as any)[badge.tone]}>
                            {badge.label}
                          </Badge>
                        ))}
                      </Flex>
                      <Button
                        as={NextLink}
                        href={preset.href}
                        size="sm"
                        rightIcon={<FiArrowRight />}
                        {...(isDestructive ? { variant: 'destructive' } : primaryButtonProps)}
                      >
                        Jogar agora
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        </MotionBox>

        <Box
          h="1px"
          bgGradient="linear(to-r, rgba(14, 116, 144, 0), rgba(34, 211, 238, 0.45), rgba(251, 191, 36, 0.45), rgba(14, 116, 144, 0))"
          my={{ base: 12, md: 16 }}
        />

        <MotionBox as="section" {...sectionMotion}>
          <Card {...cardStyle}>
            <CardBody>
              <VStack align="flex-start" spacing={4}>
                <Heading fontSize={{ base: 'xl', md: '2xl' }}>
                  Escolha sua estratégia: estabilidade, caos ou jackpot.
                </Heading>
                <Text color="whiteAlpha.700">Os resultados variam por modo.</Text>
                <Button as={NextLink} href="/play" size="lg" rightIcon={<FiArrowRight />} {...primaryButtonProps}>
                  Entrar em uma partida
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  )
}
