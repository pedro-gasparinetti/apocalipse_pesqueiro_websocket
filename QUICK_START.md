# Quick Start Guide - New Frontend

## What's New?

Your Common Pool Resource fishing game now has a **completely redesigned, modern frontend**!

### Key Features

✨ **Beautiful PixiJS Lake Scene**
- Animated boats for each player
- Swimming fish that respond to lake population
- Water ripples and rising bubbles
- Smooth 60 FPS animations

🎨 **Contemporary Design**
- Clean, minimal Chakra UI components
- Sober color palette (ocean blues, earth tones)
- Mobile-first responsive layout
- Professional gradients and shadows

📱 **Mobile-Optimized**
- Touch-friendly controls
- Responsive grids (stacks on mobile, side-by-side on desktop)
- Large, readable text and buttons
- Swipe-friendly charts

📊 **Clear Data Visualization**
- Real-time leaderboard with rankings
- Interactive charts showing lake health and sustainability
- Stat cards with gradients and icons
- Historical round data

ℹ️ **Transparent Game Rules**
- Comprehensive instructions modal
- Every cost and rule clearly explained
- Visual badges for key numbers
- Color-coded warnings and tips

## Running the Game

1. **Start both servers:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Go to http://localhost:3000
   - Open multiple tabs to simulate players
   - Each tab = different player

3. **First time?**
   - Instructions will open automatically
   - Read through the game mechanics
   - Close and start playing!

## How to Play (Quick Reference)

### Each Round:
1. **Set your catch amount** using the slider (0-20 fish)
   - Green = Sustainable (≤11 fish)
   - Red = Overfishing (>11 fish)

2. **Optionally inspect a player** by clicking their avatar
   - Costs 2 fish from your catch
   - Can't inspect if you're overfishing

3. **Click "Submit Your Play"**
   - Wait for other players
   - Results appear after all players submit

### Winning Strategy:
- Balance personal gain vs. group sustainability
- If everyone overfishes, the lake dies and everyone loses
- Strategic inspection deters cheaters
- Sustainable fishing allows the lake to grow (2% per round)

## Components Overview

### Main Screen Layout

```
┌─────────────────────────────────────────┐
│  Header (Title + Info/Stats/Restart)   │
├─────────────────────────────────────────┤
│  [My Fish] [Lake] [Bank] [Round]       │  ← Stat Cards
├─────────────────────────────────────────┤
│  ╔═══════════════════════════════════╗  │
│  ║   PixiJS Lake Scene               ║  │  ← Animated
│  ║   Boats │ Fish │ Water │ Bubbles  ║  │
│  ╚═══════════════════════════════════╝  │
├──────────────────┬──────────────────────┤
│  Fishing Slider  │   Leaderboard        │
│  Player Selector │   Charts (optional)  │
└──────────────────┴──────────────────────┘
```

### On Mobile:
Everything stacks vertically for easy scrolling

### Key Interactions:
- **Slider**: Drag to set catch amount
- **Player Cards**: Click to select inspection target
- **Info Icon**: Reopen instructions anytime
- **Charts Icon**: Toggle statistics display
- **Restart (Host only)**: Start new game

## File Changes

### New Components (in `src/app/components/`)
- `NewGameRoom.tsx` - Main game orchestrator
- `InstructionsPanel.tsx` - Game rules modal
- `LakeScene.tsx` - PixiJS visualization
- `Leaderboard.tsx` - Player rankings
- `GameChart.tsx` - Data charts
- `GameStats.tsx` - Metric cards
- `PlayerSelector.tsx` - Inspection UI

### Configuration
- `src/app/theme.ts` - Chakra UI theme (colors, fonts, component styles)
- `src/app/providers.tsx` - Chakra provider wrapper
- `src/app/layout.tsx` - Updated with Chakra provider

### Old Files
- `src/app/components/GameRoom.tsx.bak` - Original (renamed as backup)

## Customization

### Change Colors
Edit `src/app/theme.ts`:
```typescript
colors: {
  brand: { 500: '#YOUR_COLOR' },  // Primary color
  lake: { 500: '#YOUR_COLOR' },   // Lake blue
  // ... etc
}
```

### Adjust Game Settings
Edit `src/app/components/NewGameRoom.tsx`:
```typescript
const initialState: GameState = {
  limiteSustentavel: 11,        // Sustainable limit
  limitePossivelRodada: 20,     // Max per round
  limiteRodadas: 10,             // Total rounds
  taxaCrescimento: 0.02,         // Growth rate (2%)
  custoFiscalizacao: 2,          // Inspection cost
  quantidadeInicialPeixesJogador: 100,  // Starting fish
  // ...
}
```

### Modify PixiJS Scene
Edit `src/app/components/LakeScene.tsx`:
- Boat colors: `boatColors` array
- Bubble count: loop that creates bubbles
- Fish appearance: `createFish()` function
- Animation speeds: values in `app.ticker.add()`

## Troubleshooting

### Build errors?
```bash
npm run build
# If errors, check console for details
```

### PixiJS not showing?
- Check browser console for errors
- Ensure canvas ref is attached
- WebGL may not be supported (fallback to canvas)

### Styles not applying?
- Clear `.next` cache: `npm run clean`
- Restart dev server: `npm run dev`

### Players not syncing?
- Ensure backend is running (port 3001)
- Check Socket.IO connection in browser console
- Verify both servers started with `npm run dev`

## Need Help?

### Documentation
- Read [FRONTEND_REDESIGN.md](./FRONTEND_REDESIGN.md) for detailed architecture
- Read [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for server setup

### Debug Mode
Open browser console (F12) to see:
- Socket.IO connection logs
- Game state updates
- Player actions
- Round processing

---

**Enjoy the new frontend! 🚀**

Built with React, Next.js, Chakra UI, and PixiJS
Designed with love for clarity, beauty, and usability ❤️
