const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.SOCKET_PORT || 3001;

// Game state and players storage
const gameRooms = new Map();
const players = new Map();

console.log('[SOCKET-SERVER] Starting Socket.IO server...');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log('[SOCKET-SERVER] Socket.IO server initialized');

io.on('connection', (socket) => {
  console.log('[CONNECTION] User connected:', socket.id);

  // Handle player joining
  socket.on('join-game', (playerData, callback) => {
    console.log('[JOIN] Player joining:', playerData?.name || 'Unknown', 'Socket:', socket.id);
    
    try {
      const player = {
        id: socket.id,
        name: playerData?.name || `Player ${socket.id.substring(0, 6)}`,
        photo: playerData?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
        state: {},
        roomId: playerData?.roomId || 'default-room'
      };
      
      players.set(socket.id, player);
      socket.join(player.roomId);

      if (!gameRooms.has(player.roomId)) {
        console.log('[ROOM] Creating new room:', player.roomId);
        gameRooms.set(player.roomId, {
          id: player.roomId,
          players: new Map(),
          gameState: {},
          host: socket.id
        });
      }

      const room = gameRooms.get(player.roomId);
      room.players.set(socket.id, player);

      console.log('[ROOM] Player added to room. Total players:', room.players.size);

      socket.to(player.roomId).emit('player-joined', {
        player: {
          id: player.id,
          name: player.name,
          photo: player.photo
        }
      });

      const playersArray = Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        photo: p.photo,
        state: p.state
      }));

      console.log('[JOIN] Sending room state to new player. Players count:', playersArray.length);

      callback({
        success: true,
        player: {
          id: player.id,
          name: player.name,
          photo: player.photo
        },
        players: playersArray,
        gameState: room.gameState,
        isHost: socket.id === room.host
      });

      io.to(player.roomId).emit('players-updated', playersArray);
    } catch (error) {
      console.error('[JOIN] Error joining game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle player state updates
  socket.on('update-player-state', (data) => {
    console.log('[STATE] Player state update:', socket.id, data);
    
    try {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room) {
          // Check if it's a host update for another player
          if (data.playerId && data.playerId !== socket.id && socket.id === room.host) {
             const targetPlayer = room.players.get(data.playerId);
             if (targetPlayer) {
               targetPlayer.state = { ...targetPlayer.state, ...data.state };
               
               // Broadcast to all (including target)
               io.to(player.roomId).emit('player-state-updated', {
                 playerId: data.playerId,
                 state: data.state
               });
             }
          } else {
            // Normal self-update
            const roomPlayer = room.players.get(socket.id);
            if (roomPlayer) {
              // Handle both formats: { key: value } or { state: { key: value } }
              const updateData = data.state || data;
              roomPlayer.state = { ...roomPlayer.state, ...updateData };
              
              socket.to(player.roomId).emit('player-state-updated', {
                playerId: socket.id,
                state: updateData
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('[STATE] Error updating player state:', error);
    }
  });

  // Handle game state updates
  socket.on('update-game-state', (gameState) => {
    console.log('[GAME-STATE] Game state update from:', socket.id);
    
    try {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room && socket.id === room.host) {
          console.log('[GAME-STATE] Updating game state (host action)');
          room.gameState = gameState;
          
          io.to(player.roomId).emit('game-state-updated', gameState);
        } else {
          console.log('[GAME-STATE] Non-host tried to update game state:', socket.id);
        }
      }
    } catch (error) {
      console.error('[GAME-STATE] Error updating game state:', error);
    }
  });

  // Handle RPC calls
  socket.on('rpc-call', (data) => {
    console.log('[RPC] RPC call:', data?.method, 'from:', socket.id, 'data:', data?.data);
    
    try {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room) {
          if (data.mode === 'HOST') {
            const hostSocket = io.sockets.sockets.get(room.host);
            if (hostSocket) {
              console.log('[RPC] Sending to host:', room.host);
              hostSocket.emit('rpc-received', {
                method: data.method,
                data: data.data,
                caller: {
                  id: socket.id,
                  name: player.name,
                  photo: player.photo
                }
              });
            }
          } else {
            console.log('[RPC] Broadcasting to room:', player.roomId);
            io.to(player.roomId).emit('rpc-received', {
              method: data.method,
              data: data.data,
              caller: {
                id: socket.id,
                name: player.name,
                photo: player.photo
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('[RPC] Error handling RPC call:', error);
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('[DISCONNECT] User disconnected:', socket.id);
    
    try {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room) {
          room.players.delete(socket.id);
          
          socket.to(player.roomId).emit('player-left', {
            playerId: socket.id,
            playerName: player.name
          });

          const playersArray = Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            photo: p.photo,
            state: p.state
          }));
          
          io.to(player.roomId).emit('players-updated', playersArray);

          console.log('[DISCONNECT] Room now has', room.players.size, 'players');

          if (room.players.size === 0) {
            console.log('[CLEANUP] Removing empty room:', player.roomId);
            gameRooms.delete(player.roomId);
          } else if (socket.id === room.host) {
            const newHost = room.players.keys().next().value;
            room.host = newHost;
            console.log('[HOST] New host assigned:', newHost);
            io.to(player.roomId).emit('new-host', { hostId: newHost });
          }
        }
        players.delete(socket.id);
      }
    } catch (error) {
      console.error('[DISCONNECT] Error handling disconnect:', error);
    }
  });
});

httpServer
  .once('error', (err) => {
    console.error('[ERROR] Socket server error:', err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`[SOCKET-SERVER] Ready on http://localhost:${port}`);
    console.log('[SOCKET-SERVER] Waiting for connections...');
  });
