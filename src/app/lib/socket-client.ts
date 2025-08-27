import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { PlayerProfile, PlayerState, SocketEventData, JoinGameResponse, RpcCallData } from '../types/SocketTypes';

// Re-export types for easier importing
export type { PlayerProfile, PlayerState } from '../types/SocketTypes';

// Connect to separate Socket.IO server
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Global state
let socket: Socket | null = null;
let currentPlayer: PlayerState | null = null;
let gameState: any = {};
let players: PlayerState[] = [];
let isConnected = false;
let isHostPlayer = false;

// Event callbacks
const playerJoinCallbacks: ((player: PlayerState) => void)[] = [];
const gameStateCallbacks: ((state: any) => void)[] = [];
const playersUpdateCallbacks: ((players: PlayerState[]) => void)[] = [];
const rpcHandlers: Record<string, (data: any, caller: PlayerState) => void> = {};

// RPC modes
export const RPC = {
  Mode: {
    HOST: 'HOST',
    ALL: 'ALL'
  },
  register: (method: string, handler: (data: any, caller: PlayerState) => void) => {
    console.log('[RPC] Registering handler for:', method);
    rpcHandlers[method] = handler;
  },
  call: (method: string, data: any, mode: string = 'ALL') => {
    console.log('[RPC] Calling:', method, 'with data:', data, 'mode:', mode);
    if (socket) {
      socket.emit('rpc-call', { method, data, mode });
    }
  }
};

// Create player state object
function createPlayerState(playerData: any): PlayerState {
  const playerState: PlayerState = {
    id: playerData.id,
    name: playerData.name,
    photo: playerData.photo,
    state: playerData.state || {},
    
    getProfile: () => ({
      name: playerState.name,
      photo: playerState.photo
    }),
    
    getState: (key: string) => {
      return playerState.state[key];
    },
    
    setState: (key: string, value: any, reliable: boolean = false) => {
      console.log('[PLAYER-STATE] Setting state:', key, '=', value, 'for player:', playerState.id);
      playerState.state[key] = value;
      
      if (socket && playerState.id === currentPlayer?.id) {
        socket.emit('update-player-state', { [key]: value });
      }
    },
    
    onQuit: (callback: () => void) => {
      // This will be handled by socket disconnect events
    }
  };
  
  return playerState;
}

// Initialize connection (replaces insertCoin)
export async function insertCoin(options: { matchmaking?: boolean; skipLobby?: boolean } = {}): Promise<void> {
  console.log('[INIT] Inserting coin with options:', options);
  console.log('[INIT] Connecting to Socket.IO server at:', SOCKET_URL);
  
  return new Promise((resolve, reject) => {
    if (socket && socket.connected) {
      console.log('[INIT] Already connected');
      resolve();
      return;
    }

    console.log('[INIT] Connecting to Socket.IO server...');
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[INIT] Connected to server with socket ID:', socket!.id);
      isConnected = true;

      // Join game with player data
      const playerName = `Player ${Math.floor(Math.random() * 1000)}`;
      console.log('[INIT] Joining game as:', playerName);
      
      socket!.emit('join-game', {
        name: playerName,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket!.id}`,
        roomId: 'default-room'
      }, (response: any) => {
        console.log('[INIT] Join game response:', response);
        
        if (response.success) {
          currentPlayer = createPlayerState(response.player);
          isHostPlayer = response.isHost;
          
          // Initialize players array
          players = response.players.map((p: any) => createPlayerState(p));
          gameState = response.gameState;
          
          console.log('[INIT] Current player set:', currentPlayer.id, 'isHost:', isHostPlayer);
          console.log('[INIT] Initial players:', players.length);
          
          resolve();
        } else {
          reject(new Error('Failed to join game'));
        }
      });
    });

    // Handle player joining
    socket.on('player-joined', (data: SocketEventData) => {
      console.log('[EVENT] Player joined:', data.player?.name);
      if (data.player) {
        const newPlayer = createPlayerState(data.player);
        
        // Call registered join callbacks
        playerJoinCallbacks.forEach(callback => {
          try {
            callback(newPlayer);
          } catch (error) {
            console.error('[EVENT] Error in player join callback:', error);
          }
        });
      }
    });

    // Handle players list updates
    socket.on('players-updated', (playersData: any[]) => {
      console.log('[EVENT] Players updated, count:', playersData.length);
      players = playersData.map((p: any) => createPlayerState(p));
      
      // Call update callbacks
      playersUpdateCallbacks.forEach(callback => {
        try {
          callback(players);
        } catch (error) {
          console.error('[EVENT] Error in players update callback:', error);
        }
      });
    });

    // Handle player state updates
    socket.on('player-state-updated', (data: SocketEventData) => {
      console.log('[EVENT] Player state updated:', data.playerId, data.state);
      const player = players.find(p => p.id === data.playerId);
      if (player && data.state) {
        Object.assign(player.state, data.state);
      }
    });

    // Handle game state updates
    socket.on('game-state-updated', (newGameState: any) => {
      console.log('[EVENT] Game state updated');
      gameState = newGameState;
      
      // Call registered callbacks
      gameStateCallbacks.forEach(callback => {
        try {
          callback(gameState);
        } catch (error) {
          console.error('[EVENT] Error in game state callback:', error);
        }
      });
    });

    // Handle RPC calls
    socket.on('rpc-received', (data: SocketEventData) => {
      console.log('[EVENT] RPC received:', data.method, 'from:', data.caller?.name);
      if (data.method) {
        const handler = rpcHandlers[data.method];
        if (handler && data.caller) {
          const callerPlayer = createPlayerState(data.caller);
          try {
            handler(data.data, callerPlayer);
          } catch (error) {
            console.error('[EVENT] Error in RPC handler:', error);
          }
        }
      }
    });

    // Handle new host assignment
    socket.on('new-host', (data: SocketEventData) => {
      console.log('[EVENT] New host assigned:', data.hostId);
      isHostPlayer = (data.hostId === socket!.id);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[ERROR] Connection error:', error);
      reject(error);
    });

    socket.on('disconnect', () => {
      console.log('[DISCONNECT] Disconnected from server');
      isConnected = false;
    });
  });
}

// Check if current player is host
export function isHost(): boolean {
  return isHostPlayer;
}

// Get current player
export function myPlayer(): PlayerState | null {
  return currentPlayer;
}

// Register callback for when players join
export function onPlayerJoin(callback: (player: PlayerState) => void): void {
  console.log('[CALLBACK] Registering player join callback');
  playerJoinCallbacks.push(callback);
}

// Hook for multiplayer state (replaces useMultiplayerState)
export function useMultiplayerState<T>(key: string, initialValue: T): [T, (value: T, reliable?: boolean) => void] {
  const [state, setState] = useState<T>(gameState[key] ?? initialValue);
  const stateRef = useRef<T>(state);
  
  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    const callback = (newGameState: any) => {
      console.log('[MULTIPLAYER-STATE] Received state update for key:', key, 'current:', stateRef.current, 'new:', newGameState[key]);
      if (newGameState[key] !== undefined && JSON.stringify(newGameState[key]) !== JSON.stringify(stateRef.current)) {
        console.log('[MULTIPLAYER-STATE] Applying state update for key:', key, '=', newGameState[key]);
        setState(newGameState[key]);
      }
    };
    
    gameStateCallbacks.push(callback);
    
    return () => {
      const index = gameStateCallbacks.indexOf(callback);
      if (index > -1) {
        gameStateCallbacks.splice(index, 1);
      }
    };
  }, [key]);

  const updateState = useCallback((value: T, reliable: boolean = false) => {
    // Only update if the value is actually different from current React state
    if (JSON.stringify(stateRef.current) === JSON.stringify(value)) {
      console.log('[MULTIPLAYER-STATE] Skipping update - same as current state:', key, '=', value);
      return;
    }
    
    console.log('[MULTIPLAYER-STATE] Updating state:', key, 'from:', stateRef.current, 'to:', value);
    setState(value);
    gameState[key] = value;
    
    if (socket && isHostPlayer) {
      socket.emit('update-game-state', { ...gameState, [key]: value });
    }
  }, [key, stateRef]);

  return [state, updateState];
}

// Hook for players list (replaces usePlayersList)
export function usePlayersList(includeSelf: boolean = true): PlayerState[] {
  const [playersList, setPlayersList] = useState<PlayerState[]>([]);
  
  useEffect(() => {
    const updatePlayersList = () => {
      let filteredPlayers = [...players];
      if (!includeSelf && currentPlayer) {
        filteredPlayers = players.filter(p => p.id !== currentPlayer!.id);
      }
      setPlayersList(filteredPlayers);
    };

    // Initial update
    updatePlayersList();
    
    const callback = (updatedPlayers: PlayerState[]) => {
      players = updatedPlayers;
      updatePlayersList();
    };
    
    playersUpdateCallbacks.push(callback);
    
    return () => {
      const index = playersUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        playersUpdateCallbacks.splice(index, 1);
      }
    };
  }, [includeSelf]);

  return playersList;
}

// Hook for players state (replaces usePlayersState)
export function usePlayersState(stateKey: string): Array<{ player: PlayerState; state: any }> {
  const [playersState, setPlayersState] = useState<Array<{ player: PlayerState; state: any }>>([]);
  
  useEffect(() => {
    const updatePlayersState = () => {
      const stateArray = players
        .filter(player => player.getState(stateKey) !== undefined && player.getState(stateKey) !== null)
        .map(player => ({
          player,
          state: player.getState(stateKey)
        }));
      setPlayersState(stateArray);
    };

    // Initial update
    updatePlayersState();
    
    const callback = () => {
      updatePlayersState();
    };
    
    playersUpdateCallbacks.push(callback);
    
    return () => {
      const index = playersUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        playersUpdateCallbacks.splice(index, 1);
      }
    };
  }, [stateKey]);

  return playersState;
}
