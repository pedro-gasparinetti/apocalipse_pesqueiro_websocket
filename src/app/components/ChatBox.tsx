'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Avatar,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { FaPaperPlane } from 'react-icons/fa'
import { useRef, useEffect } from 'react'

interface ChatMessage {
  playerName: string
  playerPhoto: string
  message: string
  timestamp?: number
}

interface ChatBoxProps {
  messages: string[]
  players: any[]
  onSendMessage: (message: string) => void
}

export default function ChatBox({ messages, players, onSendMessage }: ChatBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    const message = inputRef.current?.value.trim()
    if (message) {
      onSendMessage(message)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  // Parse chat messages to extract player name and message
  const parsedMessages = messages.map((msg, index) => {
    const parts = msg.split(': ')
    const playerName = parts[0]
    const messageText = parts.slice(1).join(': ')
    const player = players.find(p => p.getProfile().name === playerName)

    return {
      id: index,
      playerName,
      playerPhoto: player?.getProfile().photo || '',
      message: messageText,
    }
  })

  return (
    <Card borderRadius="xl" boxShadow="float" overflow="hidden" h="100%" bg="rgba(255,255,255,0.01)" _dark={{ bg: 'rgba(14,18,28,0.95)' }} border="1px solid rgba(255,255,255,0.1)">
      <CardHeader bgGradient="linear(to-r, accent.500, accent.600)" py={3} px={4} bg="transparent">
        <Heading size="sm" color="white">
          Game Chat
        </Heading>
      </CardHeader>
      <CardBody p={0} display="flex" flexDirection="column" h="100%">
        {/* Messages Area */}
        <Box
          flex="1"
          overflowY="auto"
          p={4}
          bg="rgba(12,18,31,0.04)"
          _dark={{ bg: 'rgba(255,255,255,0.03)' }}
          maxH="300px"
          minH="200px"
        >
          <VStack spacing={3} align="stretch">
            {parsedMessages.length === 0 ? (
              <Text color="gray.500" fontSize="sm" textAlign="center" py={8}>
                No messages yet. Start the conversation!
              </Text>
            ) : (
              parsedMessages.map((msg) => (
                <HStack key={msg.id} align="start" spacing={3}>
                  <Avatar
                    size="sm"
                    name={msg.playerName}
                    src={msg.playerPhoto}
                    border="2px"
                    borderColor="accent.200"
                  />
                  <Box
                    flex="1"
                    bg="rgba(255,255,255,0.95)"
                    _dark={{ bg: 'rgba(20,24,32,0.9)' }}
                    borderRadius="lg"
                    p={3}
                    boxShadow="soft"
                    border="1px solid rgba(12,18,31,0.08)"
                  >
                    <Text fontSize="xs" fontWeight="600" color="ink.500" _dark={{ color: 'accent.200' }} mb={1}>
                      {msg.playerName}
                    </Text>
                    <Text fontSize="sm" color="ink.800" _dark={{ color: 'paper.100' }}>
                      {msg.message}
                    </Text>
                  </Box>
                </HStack>
              ))
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <Divider />

        {/* Input Area */}
        <HStack p={4} bg="rgba(255,255,255,0.95)" _dark={{ bg: 'rgba(20,24,32,0.9)' }} spacing={2}>
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            borderRadius="lg"
            bg="rgba(12,18,31,0.04)"
            _dark={{ bg: 'rgba(255,255,255,0.06)' }}
            border="1px solid rgba(12,18,31,0.12)"
            _hover={{ borderColor: 'accent.300' }}
            _focus={{
              borderColor: 'accent.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
              bg: 'white',
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FaPaperPlane />}
            onClick={handleSend}
            variant="primary"
            borderRadius="pill"
            size="md"
          />
        </HStack>
      </CardBody>
    </Card>
  )
}
