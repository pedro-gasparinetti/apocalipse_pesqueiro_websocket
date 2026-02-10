'use client'

import Link from 'next/link'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Text,
  Spacer,
  Collapse,
  VStack,
  Divider,
  Badge,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react'
import { FiMenu, FiX, FiMoon, FiSun, FiActivity } from 'react-icons/fi'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
]

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={30}
      px={{ base: 4, md: 6 }}
      py={3}
      backdropFilter="blur(12px)"
      bg="rgba(255,255,255,0.72)"
      _dark={{ bg: 'rgba(12,16,24,0.82)' }}
      borderBottom="1px solid"
      borderColor="rgba(12,18,31,0.06)"
      boxShadow="sm"
    >
      <Flex align="center" gap={4}>
        <HStack spacing={3}>
          <Badge colorScheme="accent" borderRadius="full" px={2.5} py={1} bg="accent.50" color="accent.700" _dark={{ bg: 'rgba(91,141,239,0.2)', color: 'accent.100' }}>
            Live
          </Badge>
          <Text fontSize="lg" fontWeight={700} letterSpacing="-0.02em">
            Commons Studio
          </Text>
        </HStack>

        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          {links.map((link) => (
            <Button key={link.href} as={Link} href={link.href} variant="ghost" size="sm" px={3}>
              {link.label}
            </Button>
          ))}
        </HStack>

        <Spacer />

        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            size="sm"
            onClick={toggleColorMode}
          />
          <Button leftIcon={<FiActivity />} as={Link} href="/dashboard" size="sm" variant="primary">
            Start simulation
          </Button>
          <IconButton
            aria-label="Toggle menu"
            icon={isOpen ? <FiX /> : <FiMenu />}
            display={{ base: 'inline-flex', md: 'none' }}
            variant="ghost"
            size="sm"
            onClick={onToggle}
          />
        </HStack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" mt={3} display={{ md: 'none' }} spacing={2}>
          <Divider />
          {links.map((link) => (
            <Button key={link.href} as={Link} href={link.href} variant="ghost" justifyContent="flex-start">
              {link.label}
            </Button>
          ))}
          <Button as={Link} href="/dashboard" variant="secondary">
            Go to dashboard
          </Button>
        </VStack>
      </Collapse>
    </Box>
  )
}
