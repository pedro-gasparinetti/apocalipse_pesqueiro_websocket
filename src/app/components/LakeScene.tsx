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
  backgroundColor?: number
  fishOpacity?: number
  fishSize?: number
  fishTrailSize?: number
  fishTrailLength?: number
  boatColors?: number[]
  speedFactor?: number
  boatSize?: number
  surface?: {
    enabled?: boolean
    opacity?: number
    tint?: number
  }
  fullScreen?: boolean
}

type Fish = { sprite: Graphics; vx: number; vy: number; history: { x: number; y: number }[] }
type Boat = { graphic: Graphics; vx: number; phase: number }

export default function LakeScene({
  fishCount,
  playerCount,
  currentRound,
  isGameActive,
  height = 'calc(100vh - 200px)',
  backgroundColor,
  fishOpacity = 0.15,
  boatColors,
  speedFactor = 0.6,
  fishSize = 6,
  fishTrailSize = 3,
  fishTrailLength = 16,
  boatSize = 30,
  surface = { enabled: true, opacity: 0.06, tint: 0xffffff },
  fullScreen = false,
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
      if (fullScreen) {
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })
      } else {
        await app.init({
          resizeTo: container,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })
      }

      if (!mounted) return
      appRef.current = app
      container.appendChild(app.canvas)

      const lakeLayer = new Graphics()
      const trailLayer = new Graphics()
      const fishLayer = new Container()
      const surfaceLayer = new Graphics()
      const boatsLayer = new Container()

      // layering: lake (bg) -> fish + trails -> surface effects -> boats (top)
      app.stage.addChild(lakeLayer)
      app.stage.addChild(trailLayer)
      app.stage.addChild(fishLayer)
      app.stage.addChild(surfaceLayer) // between fish and boats
      app.stage.addChild(boatsLayer)

      const accent = 0x5b8def
      const water = backgroundColor ?? 0x0d1723
      const boatPalette = boatColors ?? [0x6b5845, 0x4a4f55, 0x8c7a65, 0x5c5750]

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
        const size = boatSize
        g.rect(-size / 2, -size / 2, size, size)
        g.fill({ color: boatPalette[index % boatPalette.length], alpha: 0.95 })
        g.stroke({ color: 0xffffff, alpha: 0.12, width: 1 })
        g.x = (index + 1) * 140
        g.y = app.renderer.height * 0.22 + Math.sin(index) * 12
        boatsLayer.addChild(g)
        boats.push({ graphic: g, vx: (Math.random() * 0.4 + 0.25) * speedFactor, phase: Math.random() * Math.PI })
      }

      const createFish = () => {
        const s = new Graphics()
        const half = fishSize / 2
        s.rect(-half, -half, fishSize, fishSize)
        s.fill({ color: 0xffffff, alpha: fishOpacity })
        s.stroke({ color: accent, alpha: 0.65, width: 1 })
        const { width, height } = app.renderer
        s.x = Math.random() * width
        s.y = height * 0.42 + Math.random() * height * 0.45
        fishLayer.addChild(s)
        return {
          sprite: s,
          vx: (Math.random() - 0.5) * 1.2 * speedFactor,
          vy: (Math.random() - 0.5) * 1.2 * speedFactor,
          history: [] as { x: number; y: number }[],
        }
      }

      let resizeObserver: ResizeObserver | null = null
      const handleResize = () => {
        if (fullScreen) {
          app.renderer.resize(window.innerWidth, window.innerHeight)
          drawLake()
        } else {
          drawLake()
        }
      }
      if (fullScreen) {
        window.addEventListener('resize', handleResize)
      } else {
        resizeObserver = new ResizeObserver(handleResize)
        resizeObserver.observe(container)
      }

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
          const jitter = 0.004 * speedFactor
          fish.vx += Math.sin(frame * 0.008 + idx) * 0.004 + (Math.random() - 0.5) * jitter
          fish.vy += Math.cos(frame * 0.01 + idx) * 0.004 + (Math.random() - 0.5) * jitter
          fish.vx = Math.max(Math.min(fish.vx, 1.2 * speedFactor), -1.2 * speedFactor)
          fish.vy = Math.max(Math.min(fish.vy, 1.0 * speedFactor), -1.0 * speedFactor)

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
          fish.history = fish.history.slice(0, fishTrailLength)
          fish.history.forEach((point, i) => {
            const alpha = 0.22 * (1 - i / fish.history.length)
            const halfTrail = fishTrailSize / 2
            trailLayer.rect(point.x - halfTrail, point.y - halfTrail, fishTrailSize, fishTrailSize)
            trailLayer.fill({ color: accent, alpha })
          })
        })

        // Surface layer effects (between fish and boats)
        if (surface?.enabled) {
          surfaceLayer.clear()
          surfaceLayer.alpha = surface.opacity ?? 0.06
          const bandCount = 6
          const tint = surface.tint ?? 0xffffff
          for (let i = 0; i < bandCount; i++) {
            const y = (height / bandCount) * i + Math.sin(frame * 0.01 + i) * 4
            surfaceLayer.rect(0, y, width, 2)
            surfaceLayer.fill({ color: tint, alpha: (surface.opacity ?? 0.06) * 0.6 })
          }
        }
      })

      setReady(true)

      return () => {
        if (resizeObserver) resizeObserver.disconnect()
        if (fullScreen) window.removeEventListener('resize', handleResize)
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
      w={fullScreen ? '100vw' : '100%'}
      h={fullScreen ? '100vh' : height}
      borderRadius="0"
      border={backgroundColor ? 'none' : `1px solid ${borderColor}`}
      overflow="hidden"
      boxShadow={backgroundColor ? 'none' : 'float'}
      bg={backgroundColor ? `#${backgroundColor.toString(16).padStart(6, '0')}` : undefined}
      bgGradient={
        backgroundColor
          ? undefined
          : 'linear(to-br, rgba(12,18,31,0.92), rgba(18,24,36,0.86))'
      }
      _dark={{
        bgGradient: backgroundColor
          ? undefined
          : 'linear(to-br, rgba(8,10,16,0.9), rgba(6,9,14,0.9))',
      }}
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
