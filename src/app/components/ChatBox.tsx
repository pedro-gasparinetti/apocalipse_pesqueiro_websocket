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
import { myPlayer } from '../lib/socket-client'

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
  const me = myPlayer()
  const myName = me?.getProfile().name

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
              parsedMessages.map((msg) => {
                const isMine = msg.playerName === myName
                return (
                  <HStack
                    key={msg.id}
                    align={isMine ? 'end' : 'start'}
                    spacing={3}
                    justify="flex-start"
                    flexDir={isMine ? 'row-reverse' : 'row'}
                  >
                    <Avatar
                      size="sm"
                      name={msg.playerName}
                      src={msg.playerPhoto}
                      border="2px"
                      borderColor={isMine ? 'accent.400' : 'accent.200'}
                    />
                    <Box
                      flex="1"
                      bg={isMine ? 'rgba(91,141,239,0.14)' : 'rgba(255,255,255,0.06)'}
                      _dark={{ bg: isMine ? 'rgba(91,141,239,0.16)' : 'rgba(255,255,255,0.06)' }}
                      borderRadius="lg"
                      p={3}
                      boxShadow="soft"
                      border={isMine ? '1px solid rgba(91,141,239,0.35)' : '1px solid rgba(255,255,255,0.1)'}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color={isMine ? 'accent.200' : 'paper.100'}
                        _dark={{ color: isMine ? 'accent.200' : 'paper.100' }}
                        mb={1}
                        textAlign="left"
                      >
                        {msg.playerName}
                      </Text>
                      <Text fontSize="sm" color="paper.50" _dark={{ color: 'paper.100' }} textAlign="left">
                        {msg.message}
                      </Text>
                    </Box>
                  </HStack>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <Divider />

        {/* Input Area */}
        <HStack
          p={4}
          spacing={2}
          bg="rgba(255,255,255,0.04)"
          _dark={{ bg: 'rgba(255,255,255,0.03)' }}
          border="1px solid rgba(255,255,255,0.1)"
          borderRadius="xl"
          boxShadow="soft"
        >
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            borderRadius="lg"
            bg="rgba(255,255,255,0.06)"
            _dark={{ bg: 'rgba(255,255,255,0.08)' }}
            border="1px solid rgba(255,255,255,0.12)"
            _hover={{ borderColor: 'accent.300' }}
            _focus={{
              borderColor: 'accent.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
              bg: 'rgba(255,255,255,0.12)',
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
