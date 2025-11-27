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
    <Card borderRadius="xl" boxShadow="md" overflow="hidden" h="100%">
      <CardHeader bg="brand.500" py={3} px={4}>
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
          bg="gray.50"
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
                    borderColor="brand.200"
                  />
                  <Box
                    flex="1"
                    bg="white"
                    borderRadius="lg"
                    p={3}
                    boxShadow="sm"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Text fontSize="xs" fontWeight="600" color="brand.600" mb={1}>
                      {msg.playerName}
                    </Text>
                    <Text fontSize="sm" color="gray.800">
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
        <HStack p={4} bg="white" spacing={2}>
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            borderRadius="lg"
            bg="gray.50"
            border="1px"
            borderColor="gray.300"
            _hover={{ borderColor: 'brand.400' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              bg: 'white',
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FaPaperPlane />}
            onClick={handleSend}
            colorScheme="brand"
            borderRadius="lg"
            size="md"
          />
        </HStack>
      </CardBody>
    </Card>
  )
}
