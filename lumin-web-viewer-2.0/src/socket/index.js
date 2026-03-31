import io from 'socket.io-client';

import selectors from 'selectors';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import SessionUtils from 'utils/session';

import { DefaultErrorCode } from 'constants/errorCode';
import { SOCKET_EMIT, SOCKET_ON } from 'constants/socketConstant';
import { SOCKET_IO_URL } from 'constants/urls';

import { connectionLoggingHandler } from './handlers/connectionLoggingHandler';
import { socketHandlerRegistry } from './handlers/handlers';
import { useCollaborationStore, SocketStatus } from '../features/Collaboration/slices';
import { setOffline } from '../redux/actions/authActions';
import { store } from '../redux/store';

const EVENTS_NAME = {
  ONLINE_HANDLER: 'online_handler',
};
class Socket {
  _pendingOnEvents = [];

  _pendingEmitEvents = [];

  _pendingRemoveListenerEvents = [];

  _authenticatedSuccess = false;

  _id = null;

  constructor() {
    this._socket = null;
    this.handler = {};
    this.collaborationStore = useCollaborationStore.getState();

    this.startConnectionWithQuery();
    this.setupSocketHandlers();
    this.dispatch = store.dispatch;
    this.getState = store.getState;
  }

  // eslint-disable-next-line class-methods-use-this
  setupSocketHandlers() {
    socketHandlerRegistry.register(connectionLoggingHandler);

    /**
     * ⚠️ Lazy load annotationSyncHandler to avoid circular dependency
     */
    import('./handlers/annotationSyncHandler').then(({ annotationSyncHandler }) => {
      socketHandlerRegistry.register(annotationSyncHandler);
    });
  }

  onAuthenticated = () => {
    this._socket.on(SOCKET_ON.AUTHENTICATED, async () => {
      this.collaborationStore.setSocketAuthenticated();
      this.releasePendingEvents();
      await socketHandlerRegistry.executeHandlers('onAuthenticated');
    });
  };

  // eslint-disable-next-line class-methods-use-this
  startConnection = (options) => io(SOCKET_IO_URL, { forceNew: true, transports: ['websocket'], ...options });

  closeConnection = () => this._socket && this._socket.close();

  startConnectionWithQuery = async () => {
    this.closeConnection();

    this.collaborationStore.setSocketStatus(SocketStatus.CONNECTING);

    this._socket = this.startConnection();

    this._socket.on(SOCKET_ON.CONNECT, async () => {
      this._id = this._socket.id;

      this.collaborationStore.setSocketConnected(this._id);

      const handler = this.handler[EVENTS_NAME.ONLINE_HANDLER];
      if (handler && selectors.isOffline(this.getState())) {
        handler();
      }

      if (!process.env.DEBUG_OFFLINE_MODE) {
        this.dispatch(setOffline(false));
        this.collaborationStore.setOnlineStatus(true);
      }

      await socketHandlerRegistry.executeHandlers('onConnect');
    });
    this.onAuthenticated();
    const pathName = window.location.pathname.includes('/viewer') ? '/viewer/:documentId' : window.location.pathname;

    this._socket.on('reconnect_attempt', async (number) => {
      this.collaborationStore.setSocketReconnecting(number);
      await socketHandlerRegistry.executeHandlers('onReconnectAttempt', { attemptNumber: number, pathName });
    });

    this._socket.on('reconnect', async (number) => {
      this.collaborationStore.setSocketConnected(this._socket.id);
      await socketHandlerRegistry.executeHandlers('onReconnect', { attemptNumber: number });
    });

    this._socket.on('reconnect_error', async (error = {}) => {
      this.collaborationStore.setSocketError(error.message || 'Reconnection error');

      await socketHandlerRegistry.executeHandlers('onReconnectError', { error, pathName });
    });

    this._socket.on('reconnect_failed', async () => {
      this.collaborationStore.setSocketError('All reconnection attempts failed');
      await socketHandlerRegistry.executeHandlers('onReconnectFailed', { pathName });
    });

    this._socket.on(SOCKET_ON.DISCONNECT, async (reason) => {
      this._authenticatedSuccess = false;
      this.collaborationStore.setSocketDisconnected(reason);
      await socketHandlerRegistry.executeHandlers('onDisconnect');
    });

    this._socket.on(SOCKET_ON.EXCEPTION, async (error) => {
      const currenUser = selectors.getCurrentUser(this.getState());
      /*
        TEMPORARY FIX FOR LMV-3414:
        Currently, we only discover 3 case that lead to this issue.
        For cases that we can't expect, we will cover by this code.
        We will remove this code when we have a better solution.
      */
      if (error.code === DefaultErrorCode.UNAUTHORIZED && currenUser) {
        await this.authorizeSocket();
      }

      /* END */
    });

    this._socket.on(SOCKET_ON.RENEW_AUTHORIZATION_TOKEN, async () => {
      logger.logInfo({
        message: 'Renew authorization token for socket',
        reason: 'Log socket renew authorization token',
        attributes: {
          pathName,
        }
      });
      await this.authorizeSocket({ forceNew: true });
    });

  };

  emit = (message, data, ack = () => {}) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.emit(message, data, ack);
    }

    this._pendingEmitEvents.push({ message, data, ack });
  };

  on = (message, callback) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.on(message, callback);
    }

    this._pendingOnEvents.push({ message, callback });
  };

  once = (message, callback) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.once(message, callback);
    }

    this._pendingOnEvents.push({ message, callback });
  };

  removeListener = ({ message, listener }) => {
    if (this._socket && this._authenticatedSuccess) {
      return this._socket.removeListener(message, listener);
    }

    this._pendingRemoveListenerEvents.push({ message, listener });
  };

  registerOnlineHandler = (handler) => {
    this.handler[EVENTS_NAME.ONLINE_HANDLER] = handler;
  };

  releasePendingEvents() {
    this._authenticatedSuccess = true;
    if (this._pendingOnEvents.length) {
      this._pendingOnEvents.forEach((event) => this.on(event.message, event.callback));
      this._pendingOnEvents = [];
    }
    if (this._pendingEmitEvents.length) {
      this._pendingEmitEvents.forEach((event) => this.emit(event.message, event.data, event.ack));
      this._pendingEmitEvents = [];
    }
    if (this._pendingRemoveListenerEvents.length) {
      this._pendingRemoveListenerEvents.forEach((event) =>
        this.removeListener({ message: event.message, listener: event.listener })
      );
      this._pendingRemoveListenerEvents = [];
    }
  }

  async authorizeSocket({ forceNew = false } = {}) {
    const token = await SessionUtils.getAuthorizedToken({ force: forceNew });
    if (!token) {
      fireEvent('sessionExpired');
      return;
    }
    logger.logInfo({
      message: 'Authorize socket',
      reason: 'Log authorize socket',
    });
    this._socket.emit(SOCKET_EMIT.CONNECTION_INIT, {
      authorization: token,
      forceNew,
    });
  }

  onSocketConnected = () => {
    this._socket.on(SOCKET_ON.CONNECT, () => {
      this.authorizeSocket();
    });
  };
}

export const socket = new Socket();
