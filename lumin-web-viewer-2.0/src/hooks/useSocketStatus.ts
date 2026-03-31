import { useShallow } from 'zustand/react/shallow';

import { SocketStatus, useCollaborationStore } from 'features/Collaboration/slices';

type UseSocketStatusPayload = {
  status: SocketStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  isAuthenticated: boolean;
  socketId: string | null;
  isOnline: boolean;
  reconnectAttempts: number;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  error: string | null;
};

export const isConnected = (status: SocketStatus) =>
  status === SocketStatus.CONNECTED || status === SocketStatus.AUTHENTICATED;

export const isConnecting = (status: SocketStatus) =>
  status === SocketStatus.CONNECTING || status === SocketStatus.AUTHENTICATING;

export const isDisconnected = (status: SocketStatus) =>
  status === SocketStatus.DISCONNECTED || status === SocketStatus.ERROR;

export const isReconnecting = (status: SocketStatus) => status === SocketStatus.RECONNECTING;

export const isAuthenticated = (status: SocketStatus) => status === SocketStatus.AUTHENTICATED;

export const useSocketStatus = (): UseSocketStatusPayload => {
  const { socketState } = useCollaborationStore(useShallow((state) => ({ socketState: state.socketState })));

  return {
    status: socketState.status,
    isConnected: isConnected(socketState.status),
    isConnecting: isConnecting(socketState.status),
    isDisconnected: isDisconnected(socketState.status),
    isReconnecting: isReconnecting(socketState.status),
    isAuthenticated: isAuthenticated(socketState.status),

    socketId: socketState.socketId,
    isOnline: socketState.isOnline,
    reconnectAttempts: socketState.reconnectAttempts,
    lastConnectedAt: socketState.lastConnectedAt,
    lastDisconnectedAt: socketState.lastDisconnectedAt,
    error: socketState.error,
  };
};
