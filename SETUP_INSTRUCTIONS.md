# Socket.IO Separate Server Setup

## 🚀 How to Run Your Game

### Option 1: Separate Terminals (Recommended for Debugging)

**Terminal 1 - Start Socket.IO Server:**
```bash
npm run backend
```
You should see:
```
[SOCKET-SERVER] Starting Socket.IO server...
[SOCKET-SERVER] Socket.IO server initialized
[SOCKET-SERVER] Ready on http://localhost:3001
[SOCKET-SERVER] Waiting for connections...
```

**Terminal 2 - Start Next.js Frontend:**
```bash
npm run frontend
```
You should see:
```
▲ Next.js 14.2.18
- Local:        http://localhost:3000
```

### Option 2: Single Command (Both servers together)
```bash
npm run dev
```

## 🎮 How to Test

1. **Open your browser** to http://localhost:3000
2. **Open multiple tabs** or different browsers 
3. Each tab = different player
4. **Check the logs** in Terminal 1 for Socket.IO events

## 📊 What You'll See

**Socket.IO Server Terminal:**
```
[CONNECTION] User connected: abc123
[JOIN] Player joining: Player abc123
[ROOM] Creating new room: default-room
[ROOM] Player added to room. Total players: 1
```

**Browser Console (F12):**
```
[INIT] Connecting to Socket.IO server at: http://localhost:3001
[EVENT] Connected to server
[INIT] Current player set: abc123 isHost: true
```

## 🔧 Architecture

- **Socket.IO Server**: Port 3001 (Backend multiplayer logic)
- **Next.js Frontend**: Port 3000 (React game interface)
- **Clean separation**: No Next.js config conflicts!

## 🐛 Troubleshooting

**Port 3001 busy?**
```bash
# Change socket server port
SOCKET_PORT=3002 npm run socket-server
# Then update frontend to connect to 3002
```

**Connection issues?**
- Check both servers are running
- Check browser console for errors
- Verify Socket.IO server logs show connections

## 📁 Files

- `socket-server.js` - Pure Socket.IO server (Port 3001)
- `src/app/lib/socket-client.ts` - Client connecting to :3001
- Original `server.js` - Keep as backup (not used)

Your game is now running with **separate, clean servers**! 🎮
