import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

export enum SocketStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

export interface SocketState {
  status: SocketStatus;
  isOnline: boolean;
  reconnectAttempts: number;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  socketId: string | null;
  error: string | null;
}

export interface CollaborationState {
  socketState: SocketState;

  setSocketStatus: (status: SocketStatus) => void;
  setSocketConnected: (socketId: string) => void;
  setSocketDisconnected: (reason?: string) => void;
  setSocketReconnecting: (attempt: number) => void;
  setSocketAuthenticated: () => void;
  setSocketError: (error: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  resetSocket: () => void;
}

const initialSocketState: SocketState = {
  status: SocketStatus.DISCONNECTED,
  isOnline: false,
  reconnectAttempts: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  socketId: null,
  error: null,
};

const createCollaborationSlice = immer<CollaborationState>((set) => ({
  socketState: initialSocketState,

  setSocketStatus: (status: SocketStatus) => {
    set((state) => {
      state.socketState.status = status;
      state.socketState.error = null;
    });
  },

  setSocketConnected: (socketId: string) => {
    set((state) => {
      state.socketState.status = SocketStatus.CONNECTED;
      state.socketState.socketId = socketId;
      state.socketState.lastConnectedAt = new Date();
      state.socketState.reconnectAttempts = 0;
      state.socketState.error = null;
      state.socketState.isOnline = true;
    });
  },

  setSocketDisconnected: (reason?: string) => {
    set((state) => {
      state.socketState.status = SocketStatus.DISCONNECTED;
      state.socketState.lastDisconnectedAt = new Date();
      state.socketState.socketId = null;
      state.socketState.isOnline = false;
      if (reason) {
        state.socketState.error = reason;
      }
    });
  },

  setSocketReconnecting: (attempt: number) => {
    set((state) => {
      state.socketState.status = SocketStatus.RECONNECTING;
      state.socketState.reconnectAttempts = attempt;
      state.socketState.error = null;
    });
  },

  setSocketAuthenticated: () => {
    set((state) => {
      state.socketState.status = SocketStatus.AUTHENTICATED;
      state.socketState.error = null;
    });
  },

  setSocketError: (error: string) => {
    set((state) => {
      state.socketState.status = SocketStatus.ERROR;
      state.socketState.error = error;
    });
  },

  setOnlineStatus: (isOnline: boolean) => {
    set((state) => {
      state.socketState.isOnline = isOnline;
    });
  },

  resetSocket: () => {
    set((state) => {
      state.socketState = { ...initialSocketState };
    });
  },
}));

export const useCollaborationStore = create<CollaborationState, [['zustand/immer', never]]>(
  logger(createCollaborationSlice, 'useCollaborationStore')
);
