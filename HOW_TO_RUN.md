# 🚀 How to Run Your Game

## ✅ **Easy Way (Single Command)**
```bash
npm run dev
```
This runs both your backend (Socket.IO) and frontend (Next.js) together!

## 🔧 **Manual Way (Separate Terminals)**

**Terminal 1 - Backend Server:**
```bash
npm run backend
```
You should see:
```
[SOCKET-SERVER] Starting Socket.IO server...
[SOCKET-SERVER] Ready on http://localhost:3001
[SOCKET-SERVER] Waiting for connections...
```

**Terminal 2 - Frontend:**
```bash
npm run frontend  
```
You should see:
```
▲ Next.js 14.2.18
- Local: http://localhost:3000
```

## 🎮 **Test Your Game**

1. **Open your browser** to http://localhost:3000
2. **Open multiple tabs** or different browsers
3. Each tab = different player
4. **Check Terminal 1** for backend connection logs

## 📊 **What You'll See**

**Backend Terminal:**
```
[CONNECTION] User connected: abc123
[JOIN] Player joining: Player abc123
[ROOM] Creating new room: default-room
```

**Browser Console (F12):**
```
[INIT] Connecting to Socket.IO server at: http://localhost:3001
[EVENT] Connected to server
```

## 🏗️ **Your Architecture**

- **Backend**: `server.js` (Port 3001) - Socket.IO multiplayer server
- **Frontend**: Next.js (Port 3000) - Your React game interface
- **Clean separation**: No Next.js config conflicts!

## 🐛 **Troubleshooting**

**If port 3001 is busy:**
```bash
SOCKET_PORT=3002 npm run backend
```

**If you get errors:**
```bash
npm run clean
npm run dev
```

That's it! Your game is now separated and clean! 🎮
