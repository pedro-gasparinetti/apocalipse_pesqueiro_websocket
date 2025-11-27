'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  Button,
  HStack,
  Select,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiSave } from 'react-icons/fi'
import NavBar from '../components/NavBar'

export default function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode()
  const cardBg = useColorModeValue('paper.50', 'paper.900')

  return (
    <Box minH="100vh" pb={12}>
      <NavBar />
      <Container maxW="6xl" px={{ base: 4, md: 6 }} pt={{ base: 8, md: 12 }}>
        <Heading size="lg" mb={2}>Settings</Heading>
        <Text color="ink.500" _dark={{ color: 'ink.300' }} mb={8}>
          Profile, preferences, and notification controls. All UI only—backend unchanged.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Profile</Heading>
              <FormControl mb={4}>
                <FormLabel>Name</FormLabel>
                <Input placeholder="Your display name" />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="you@example.com" />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea placeholder="Short note for your teammates" />
              </FormControl>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Preferences</Heading>
              <FormControl display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <FormLabel mb="0">Dark mode</FormLabel>
                <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <FormLabel mb="0">Email alerts</FormLabel>
                <Switch defaultChecked />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <FormLabel mb="0">Session reminders</FormLabel>
                <Switch />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Locale</FormLabel>
                <Select defaultValue="en">
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </Select>
              </FormControl>
              <HStack justify="flex-end">
                <Button variant="secondary">Cancel</Button>
                <Button leftIcon={<FiSave />}>Save changes</Button>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
