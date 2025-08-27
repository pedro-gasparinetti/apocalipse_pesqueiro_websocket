const { Server } = require('socket.io');

// Simple Socket.IO setup that can be imported
function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Game state and players storage
  const gameRooms = new Map();
  const players = new Map();

  console.log('[SOCKET] Socket.IO server initialized');

  io.on('connection', (socket) => {
    console.log('[CONNECTION] User connected:', socket.id);

    // Handle player joining
    socket.on('join-game', (playerData, callback) => {
      console.log('[JOIN] Player joining:', playerData?.name || 'Unknown');
      
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
          gameRooms.set(player.roomId, {
            id: player.roomId,
            players: new Map(),
            gameState: {},
            host: socket.id
          });
        }

        const room = gameRooms.get(player.roomId);
        room.players.set(socket.id, player);

        const playersArray = Array.from(room.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          photo: p.photo,
          state: p.state
        }));

        callback({
          success: true,
          player: { id: player.id, name: player.name, photo: player.photo },
          players: playersArray,
          gameState: room.gameState,
          isHost: socket.id === room.host
        });

        socket.to(player.roomId).emit('player-joined', { player: { id: player.id, name: player.name, photo: player.photo } });
        io.to(player.roomId).emit('players-updated', playersArray);
      } catch (error) {
        console.error('[JOIN] Error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Other socket event handlers...
    socket.on('update-player-state', (data) => {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room?.players.has(socket.id)) {
          room.players.get(socket.id).state = { ...room.players.get(socket.id).state, ...data };
          socket.to(player.roomId).emit('player-state-updated', { playerId: socket.id, state: data });
        }
      }
    });

    socket.on('update-game-state', (gameState) => {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room && socket.id === room.host) {
          room.gameState = gameState;
          io.to(player.roomId).emit('game-state-updated', gameState);
        }
      }
    });

    socket.on('rpc-call', (data) => {
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room) {
          if (data.mode === 'HOST') {
            const hostSocket = io.sockets.sockets.get(room.host);
            if (hostSocket) {
              hostSocket.emit('rpc-received', {
                method: data.method,
                data: data.data,
                caller: { id: socket.id, name: player.name, photo: player.photo }
              });
            }
          } else {
            io.to(player.roomId).emit('rpc-received', {
              method: data.method,
              data: data.data,
              caller: { id: socket.id, name: player.name, photo: player.photo }
            });
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('[DISCONNECT] User disconnected:', socket.id);
      const player = players.get(socket.id);
      if (player) {
        const room = gameRooms.get(player.roomId);
        if (room) {
          room.players.delete(socket.id);
          const playersArray = Array.from(room.players.values()).map(p => ({
            id: p.id, name: p.name, photo: p.photo, state: p.state
          }));
          
          socket.to(player.roomId).emit('player-left', { playerId: socket.id, playerName: player.name });
          io.to(player.roomId).emit('players-updated', playersArray);

          if (room.players.size === 0) {
            gameRooms.delete(player.roomId);
          } else if (socket.id === room.host) {
            const newHost = room.players.keys().next().value;
            room.host = newHost;
            io.to(player.roomId).emit('new-host', { hostId: newHost });
          }
        }
        players.delete(socket.id);
      }
    });
  });

  return io;
}

module.exports = setupSocketIO;
