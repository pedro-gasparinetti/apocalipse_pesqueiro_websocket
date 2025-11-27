'use client'

import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics } from 'pixi.js'
import { Box, Flex, Badge, Text, useColorModeValue } from '@chakra-ui/react'

interface LakeSceneProps {
  fishCount: number
  playerCount: number
  currentRound: number
  isGameActive: boolean
  height?: string | number
}

type Fish = { sprite: Graphics; vx: number; vy: number; history: { x: number; y: number }[] }
type Boat = { graphic: Graphics; vx: number; phase: number }

export default function LakeScene({
  fishCount,
  playerCount,
  currentRound,
  isGameActive,
  height = 'calc(100vh - 200px)',
}: LakeSceneProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const stateRef = useRef({ fishCount, playerCount, currentRound, isGameActive })
  const [ready, setReady] = useState(false)

  const borderColor = useColorModeValue('rgba(12,18,31,0.14)', 'rgba(255,255,255,0.14)')
  const overlayBg = useColorModeValue('rgba(255,255,255,0.75)', 'rgba(12,16,24,0.6)')

  useEffect(() => {
    stateRef.current = { fishCount, playerCount, currentRound, isGameActive }
  }, [fishCount, playerCount, currentRound, isGameActive])

  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    let mounted = true
    const app = new Application()

    const init = async () => {
      await app.init({
        resizeTo: container,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (!mounted) return
      appRef.current = app
      container.appendChild(app.canvas)

      const lakeLayer = new Graphics()
      const trailLayer = new Graphics()
      const fishLayer = new Container()
      const boatsLayer = new Container()

      app.stage.addChild(lakeLayer)
      app.stage.addChild(trailLayer)
      app.stage.addChild(fishLayer)
      app.stage.addChild(boatsLayer)

      const accent = 0x5b8def
      const water = 0x0f1624

      const drawLake = () => {
        const { width, height } = app.renderer
        lakeLayer.clear()
        lakeLayer.rect(0, 0, width, height)
        lakeLayer.fill({ color: water, alpha: 0.85 })
        lakeLayer.stroke({ color: 0xffffff, alpha: 0.08, width: 1 })
      }
      drawLake()

      const boats: Boat[] = []
      const fishes: Fish[] = []

      const createBoat = (index: number) => {
        const g = new Graphics()
        const size = 30
        g.roundRect(-size / 2, -size / 2, size, size, 6)
        g.fill({ color: accent, alpha: 0.9 })
        g.stroke({ color: 0xffffff, alpha: 0.4, width: 1 })
        g.rect(-size / 4, -size / 4, size / 2, size / 2)
        g.fill({ color: 0x0f172a, alpha: 0.6 })
        g.x = (index + 1) * 140
        g.y = app.renderer.height * 0.22 + Math.sin(index) * 12
        boatsLayer.addChild(g)
        boats.push({ graphic: g, vx: Math.random() * 0.6 + 0.4, phase: Math.random() * Math.PI })
      }

      const createFish = () => {
        const s = new Graphics()
        s.rect(-3, -3, 6, 6)
        s.fill({ color: 0xffffff, alpha: 0.9 })
        s.stroke({ color: accent, alpha: 0.65, width: 1 })
        const { width, height } = app.renderer
        s.x = Math.random() * width
        s.y = height * 0.42 + Math.random() * height * 0.45
        fishLayer.addChild(s)
        return {
          sprite: s,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          history: [] as { x: number; y: number }[],
        }
      }

      const handleResize = () => drawLake()
      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(container)

      let frame = 0
      app.ticker.add((delta) => {
        frame += delta.deltaTime
        const { width, height } = app.renderer

        // Boats move gently and bounce on edges
        while (boats.length < Math.max(1, stateRef.current.playerCount)) createBoat(boats.length)
        while (boats.length > stateRef.current.playerCount) {
          const boat = boats.pop()
          boat?.graphic.destroy()
        }
        boats.forEach((boat, idx) => {
          boat.phase += 0.008 * delta.deltaTime
          boat.graphic.x += boat.vx * delta.deltaTime
          boat.graphic.y = height * 0.22 + Math.sin(frame * 0.012 + idx) * 10
          boat.graphic.rotation = Math.sin(frame * 0.004 + idx) * 0.02
          if (boat.graphic.x > width - 40 || boat.graphic.x < 40) boat.vx *= -1
        })

        // Fish population control
        const targetFish = Math.max(8, Math.min(240, Math.round(stateRef.current.fishCount)))
        while (fishes.length < targetFish) fishes.push(createFish())
        while (fishes.length > targetFish) {
          const removed = fishes.pop()
          removed?.sprite.destroy()
        }

        // Trails + smooth fish motion
        trailLayer.clear()
        fishes.forEach((fish, idx) => {
          fish.vx += Math.sin(frame * 0.01 + idx) * 0.006
          fish.vy += Math.cos(frame * 0.012 + idx) * 0.006
          fish.vx = Math.max(Math.min(fish.vx, 1.8), -1.8)
          fish.vy = Math.max(Math.min(fish.vy, 1.6), -1.6)

          fish.sprite.x += fish.vx * delta.deltaTime
          fish.sprite.y += fish.vy * delta.deltaTime

          if (fish.sprite.x > width + 10) fish.sprite.x = -10
          if (fish.sprite.x < -10) fish.sprite.x = width + 10

          const minY = height * 0.32
          const maxY = height * 0.92
          if (fish.sprite.y > maxY) {
            fish.sprite.y = maxY
            fish.vy *= -0.6
          }
          if (fish.sprite.y < minY) {
            fish.sprite.y = minY
            fish.vy *= -0.6
          }

          fish.history.unshift({ x: fish.sprite.x, y: fish.sprite.y })
          fish.history = fish.history.slice(0, 14)
          fish.history.forEach((point, i) => {
            const alpha = 0.22 * (1 - i / fish.history.length)
            trailLayer.rect(point.x - 1.5, point.y - 1.5, 3, 3)
            trailLayer.fill({ color: accent, alpha })
          })
        })
      })

      setReady(true)

      return () => {
        resizeObserver.disconnect()
      }
    }

    init()

    return () => {
      mounted = false
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [])

  return (
    <Box
      ref={canvasRef}
      position="relative"
      w="100%"
      h={height}
      borderRadius="2xl"
      border={`1px solid ${borderColor}`}
      overflow="hidden"
      boxShadow="float"
      bgGradient="linear(to-br, rgba(12,18,31,0.92), rgba(18,24,36,0.86))"
      _dark={{ bgGradient: 'linear(to-br, rgba(8,10,16,0.9), rgba(6,9,14,0.9))' }}
    >
      <Flex position="absolute" top={4} left={4} gap={2} flexWrap="wrap" zIndex={2}>
        <Badge bg={overlayBg} backdropFilter="blur(12px)" borderRadius="full" px={3} py={1}>
          Round {currentRound}
        </Badge>
        <Badge bg={overlayBg} borderRadius="full" px={3} py={1}>
          Fish {Math.round(fishCount)}
        </Badge>
        <Badge bg={overlayBg} borderRadius="full" px={3} py={1}>
          Boats {playerCount}
        </Badge>
      </Flex>
      {!ready && (
        <Flex position="absolute" inset={0} align="center" justify="center" color="white" fontWeight={700}>
          Loading lake scene...
        </Flex>
      )}
      {!isGameActive && (
        <Flex
          position="absolute"
          bottom={4}
          right={4}
          px={3}
          py={2}
          borderRadius="lg"
          bg={overlayBg}
          backdropFilter="blur(10px)"
          fontSize="sm"
        >
          <Text>Paused</Text>
        </Flex>
      )}
    </Box>
  )
}
