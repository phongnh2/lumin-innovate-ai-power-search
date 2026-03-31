interface SocketIoClient {
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, fn: any) => void;
  off: (event: string, fn?: any) => void;
  close: () => void;
}

declare class Socket {
  private _pendingOnEvents: Array<{ message: string; callback: any }>;

  private _pendingEmitEvents: Array<{ message: string; data: any; ack?: any }>;

  private _pendingRemoveListenerEvents: Array<{ message: string; listener: any }>;

  private _authenticatedSuccess: boolean;

  private _socket: SocketIoClient | null;

  public handler: { [key: string]: any };

  public _id: string | null;

  constructor();
  onAuthenticated(): void;
  startConnection(options?: any): Socket;
  closeConnection(): void;
  startConnectionWithQuery(): Promise<void>;
  emit(message: string, data: any, ack?: any): void;
  on(message: string, callback: any): void;
  once(message: string, callback: any): void;
  removeListener({ message, listener }: { message: string; listener?: any }): void;
  registerOnlineHandler(handler: any): void;
  releasePendingEvents(): void;
  authorizeSocket(options?: { forceNew?: boolean }): Promise<void>;
  onSocketConnected(): void;
}

export const socket: Socket;
