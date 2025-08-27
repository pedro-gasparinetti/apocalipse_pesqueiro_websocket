// Socket.IO types to replace PlayroomKit types

export interface PlayerProfile {
  name: string;
  photo: string;
}

export interface PlayerState {
  id: string;
  name: string;
  photo: string;
  state: Record<string, any>;
  getProfile: () => PlayerProfile;
  getState: (key: string) => any;
  setState: (key: string, value: any, reliable?: boolean) => void;
  onQuit: (callback: () => void) => void;
}

export interface SocketEventData {
  playerId?: string;
  playerName?: string;
  state?: Record<string, any>;
  method?: string;
  data?: any;
  caller?: {
    id: string;
    name: string;
    photo: string;
  };
  hostId?: string;
  player?: {
    id: string;
    name: string;
    photo: string;
  };
}

export interface JoinGameResponse {
  success: boolean;
  player: {
    id: string;
    name: string;
    photo: string;
  };
  players: Array<{
    id: string;
    name: string;
    photo: string;
    state: Record<string, any>;
  }>;
  gameState: any;
  isHost: boolean;
}

export interface RpcCallData {
  method: string;
  data: any;
  mode: string;
}
