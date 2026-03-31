// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import io from 'socket.io-client';

import { SOCKET_ON, SOCKET_EMIT } from '@/constants/socket';

import sessionManagement from '../session';

class Socket {
  _socket: any = null;
  _pendingOnEvents: any[] = [];
  _pendingEmitEvents: any[] = [];
  _pendingRemoveListenerEvents: any[] = [];
  _authenticatedSuccess = false;

  constructor() {
    this.startConnection();
  }

  onAuthenticated = () => {
    this._socket.on(SOCKET_ON.Common.AUTHENTICATED, () => {
      this._socket.emit(SOCKET_EMIT.User.JoinRoom);
      this._authenticatedSuccess = true;
      if (this._pendingOnEvents.length) {
        this._pendingOnEvents.forEach(event => this.on(event.message, event.callback));
        this._pendingOnEvents = [];
      }
      if (this._pendingEmitEvents.length) {
        this._pendingEmitEvents.forEach(event => this.emit(event.message, event.data, event.ack));
        this._pendingEmitEvents = [];
      }
      if (this._pendingRemoveListenerEvents.length) {
        this._pendingRemoveListenerEvents.forEach(event => this.removeListener(event.message));
        this._pendingRemoveListenerEvents = [];
      }
    });
  };

  startConnection = async () => {
    this.closeConnection();
    this._socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL, { transports: ['websocket'] });
    this._socket.on(SOCKET_ON.Common.Connect, async () => {
      const token = await sessionManagement.getAuthorizeToken();
      this._socket.emit(SOCKET_EMIT.AUTH.CONNECTION_INIT, {
        authorization: token
      });
    });
    this.onAuthenticated();
  };

  closeConnection = () => this._socket && this._socket.close();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  emit = (message: string, data?: any, ack = () => {}) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.emit(message, data, ack);
    }

    this._pendingEmitEvents.push({ message, data, ack });
  };

  on = (message: string, callback: (params?: any) => void) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.on(message, callback);
    }

    this._pendingOnEvents.push({ message, callback });
  };

  removeListener = (message: string) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.removeListener(message);
    }

    this._pendingRemoveListenerEvents.push({ message });
  };
}

const socket = new Socket();
export default socket;
