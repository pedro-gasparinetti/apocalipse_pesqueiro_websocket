'use client'

import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text, TextStyle, Sprite, Assets } from 'pixi.js'
import { Box } from '@chakra-ui/react'

interface LakeSceneProps {
  fishCount: number
  playerCount: number
  currentRound: number
  isGameActive: boolean
}

export default function LakeScene({ fishCount, playerCount, currentRound, isGameActive }: LakeSceneProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return

    let mounted = true
    const initPixi = async () => {
      try {
        // Create PixiJS application
        const app = new Application()
        await app.init({
          width: 800,
          height: 400,
          backgroundColor: 0x2B6CB0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        if (!mounted) {
          app.destroy()
          return
        }

        appRef.current = app
        canvasRef.current?.appendChild(app.canvas)

        // Create lake background
        const lake = new Graphics()
        lake.rect(0, 0, 800, 400)
        lake.fill({ color: 0x3182CE })
        app.stage.addChild(lake)

        // Add water ripple effect
        const ripples = new Graphics()
        app.stage.addChild(ripples)

        let ripplePhase = 0
        const drawRipples = () => {
          ripples.clear()
          ripples.alpha = 0.1

          for (let i = 0; i < 10; i++) {
            const y = i * 50 + (Math.sin(ripplePhase + i * 0.5) * 5)
            ripples.moveTo(0, y)
            ripples.lineTo(800, y)
            ripples.stroke({ color: 0xFFFFFF, width: 1 })
          }
        }

        // Create boats container
        const boatsContainer = new Container()
        app.stage.addChild(boatsContainer)

        // Create fish container
        const fishContainer = new Container()
        app.stage.addChild(fishContainer)

        // Create bubble particles
        const bubblesContainer = new Container()
        app.stage.addChild(bubblesContainer)

        const bubbles: Graphics[] = []
        const createBubble = () => {
          const bubble = new Graphics()
          const size = Math.random() * 3 + 1
          bubble.circle(0, 0, size)
          bubble.fill({ color: 0xFFFFFF, alpha: 0.3 })
          bubble.x = Math.random() * 800
          bubble.y = 400 + Math.random() * 50
          bubble.alpha = Math.random() * 0.5 + 0.2
          return bubble
        }

        // Initialize bubbles
        for (let i = 0; i < 30; i++) {
          const bubble = createBubble()
          bubbles.push(bubble)
          bubblesContainer.addChild(bubble)
        }

        // Create boats for players
        const boats: Graphics[] = []
        const createBoat = (x: number, color: number) => {
          const boat = new Graphics()

          // Boat hull
          boat.moveTo(0, 10)
          boat.lineTo(30, 10)
          boat.lineTo(35, 20)
          boat.lineTo(-5, 20)
          boat.closePath()
          boat.fill({ color: color })

          // Boat outline
          boat.moveTo(0, 10)
          boat.lineTo(30, 10)
          boat.lineTo(35, 20)
          boat.lineTo(-5, 20)
          boat.closePath()
          boat.stroke({ color: 0x000000, width: 1 })

          // Mast
          boat.rect(13, -10, 2, 20)
          boat.fill({ color: 0x8B4513 })

          // Sail
          boat.moveTo(15, -5)
          boat.lineTo(25, 0)
          boat.lineTo(15, 5)
          boat.closePath()
          boat.fill({ color: 0xFFFFFF })

          boat.x = x
          boat.y = 80

          return boat
        }

        // Position boats based on player count
        const boatColors = [0xE53E3E, 0x3182CE, 0x38A169, 0xD69E2E, 0x805AD5, 0xD53F8C]
        for (let i = 0; i < playerCount && i < 6; i++) {
          const x = 100 + (i * 120)
          const boat = createBoat(x, boatColors[i % boatColors.length])
          boats.push(boat)
          boatsContainer.addChild(boat)
        }

        // Create fish sprites
        const fishSprites: Graphics[] = []
        const createFish = () => {
          const fish = new Graphics()

          // Fish body
          fish.ellipse(0, 0, 8, 4)
          fish.fill({ color: 0xFFA500 })

          // Fish tail
          fish.moveTo(-8, 0)
          fish.lineTo(-12, -3)
          fish.lineTo(-12, 3)
          fish.closePath()
          fish.fill({ color: 0xFF8C00 })

          // Fish eye
          fish.circle(4, -1, 1)
          fish.fill({ color: 0x000000 })

          // Random position
          fish.x = Math.random() * 800
          fish.y = 150 + Math.random() * 200

          return fish
        }

        // Fish info text
        const fishTextStyle = new TextStyle({
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 24,
          fontWeight: 'bold',
          fill: 0xFFFFFF,
          dropShadow: {
            color: 0x000000,
            blur: 4,
            angle: Math.PI / 6,
            distance: 2,
          },
        })

        const fishText = new Text({
          text: `Fish in Lake: ${fishCount}`,
          style: fishTextStyle,
        })
        fishText.x = 20
        fishText.y = 20
        app.stage.addChild(fishText)

        // Round info text
        const roundText = new Text({
          text: `Round: ${currentRound}`,
          style: fishTextStyle,
        })
        roundText.x = 600
        roundText.y = 20
        app.stage.addChild(roundText)

        // Animation loop
        let animationFrame = 0
        app.ticker.add((delta) => {
          animationFrame += delta.deltaTime
          ripplePhase += 0.05 * delta.deltaTime
          drawRipples()

          // Animate boats (gentle bobbing)
          boats.forEach((boat, i) => {
            boat.y = 80 + Math.sin(animationFrame * 0.05 + i) * 3
          })

          // Animate bubbles rising
          bubbles.forEach((bubble, i) => {
            bubble.y -= 0.5 + (bubble.scale.x * 0.3)
            bubble.x += Math.sin(animationFrame * 0.02 + i) * 0.2

            // Reset bubble when it reaches top
            if (bubble.y < -10) {
              bubble.y = 410
              bubble.x = Math.random() * 800
            }
          })

          // Update fish count dynamically
          const targetFishCount = Math.min(fishCount, 100) // Cap visual fish at 100 for performance

          // Add or remove fish to match count
          while (fishSprites.length < targetFishCount) {
            const fish = createFish()
            fishSprites.push(fish)
            fishContainer.addChild(fish)
          }

          while (fishSprites.length > targetFishCount) {
            const fish = fishSprites.pop()
            if (fish) {
              fishContainer.removeChild(fish)
              fish.destroy()
            }
          }

          // Animate existing fish
          fishSprites.forEach((fish, i) => {
            fish.x += Math.sin(animationFrame * 0.02 + i) * 0.5
            fish.y += Math.cos(animationFrame * 0.03 + i * 0.5) * 0.3

            // Wrap around screen
            if (fish.x > 820) fish.x = -20
            if (fish.x < -20) fish.x = 820
            if (fish.y > 380) fish.y = 150
            if (fish.y < 140) fish.y = 370
          })

          // Update text
          fishText.text = `Fish in Lake: ${fishCount.toFixed(1)}`
          roundText.text = `Round: ${currentRound}`
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing PixiJS:', error)
        setIsLoading(false)
      }
    }

    initPixi()

    return () => {
      mounted = false
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, []) // Only initialize once

  // Update effect for dynamic values
  useEffect(() => {
    // Values are updated in the ticker loop
  }, [fishCount, playerCount, currentRound])

  return (
    <Box
      ref={canvasRef}
      w="100%"
      maxW="800px"
      h="400px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="2xl"
      position="relative"
      bg="brand.500"
      mx="auto"
    >
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          fontSize="xl"
          fontWeight="bold"
        >
          Loading lake scene...
        </Box>
      )}
    </Box>
  )
}
