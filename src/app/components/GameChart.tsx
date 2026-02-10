'use client'

import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GameChartProps {
  rounds: any[]
  playerCount: number
}

export default function GameChart({ rounds, playerCount }: GameChartProps) {
  // Prepare data for lake health chart
  const lakeData = rounds.map((round) => ({
    round: round.numero,
    'Fish in Lake': round.quantidadeLagoInicial?.toFixed(1) || 0,
    Growth: round.crescimentoLago?.toFixed(1) || 0,
    Harvested: round.quantidadeNosCestos?.toFixed(1) || 0,
  }))

  // Prepare data for sustainability chart
  const sustainabilityData = rounds.map((round) => ({
    round: round.numero,
    'Bank Accumulated': rounds
      .filter((r) => r.numero <= round.numero)
      .reduce((acc, r) => acc + (r.saldoBanca || 0), 0)
      .toFixed(1),
    'Total Growth': rounds
      .filter((r) => r.numero <= round.numero)
      .reduce((acc, r) => acc + (r.crescimentoLago || 0), 0)
      .toFixed(1),
  }))

  return (
    <Box>
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={4} borderBottom="0">
          <Tab>Lake Health</Tab>
          <Tab>Sustainability</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lakeData}>
                  <defs>
                    <linearGradient id="colorLake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3C95AB" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3C95AB" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorHarvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A57F4D" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A57F4D" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottom', offset: -5 }} stroke="#4A5568" />
                  <YAxis label={{ value: 'Fish Count', angle: -90, position: 'insideLeft' }} stroke="#4A5568" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Fish in Lake" stroke="#3C95AB" fillOpacity={1} fill="url(#colorLake)" strokeWidth={3} />
                  <Area type="monotone" dataKey="Harvested" stroke="#A57F4D" fillOpacity={1} fill="url(#colorHarvested)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Growth" stroke="#00BD69" strokeWidth={2} dot={{ fill: '#00BD69', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>

          <TabPanel p={0}>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sustainabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottom', offset: -5 }} stroke="#4A5568" />
                  <YAxis label={{ value: 'Accumulated Value', angle: -90, position: 'insideLeft' }} stroke="#4A5568" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Total Growth" stroke="#00BD69" strokeWidth={3} dot={{ fill: '#00BD69', r: 5 }} />
                  <Line type="monotone" dataKey="Bank Accumulated" stroke="#FF0000" strokeWidth={3} dot={{ fill: '#FF0000', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
