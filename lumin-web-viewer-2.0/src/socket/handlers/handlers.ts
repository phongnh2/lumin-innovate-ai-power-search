import logger from 'helpers/logger';

export interface ISocketHandler {
  name: string;
  onConnect?: () => Promise<void> | void;
  onReconnect?: (data?: unknown) => Promise<void> | void;
  onDisconnect?: (reason?: string) => Promise<void> | void;
  onAuthenticated?: () => Promise<void> | void;
  setup?: () => void;
  cleanup?: () => void;
}

export class SocketHandlerRegistry {
  private handlers: Map<string, ISocketHandler> = new Map();

  register(handler: ISocketHandler): void {
    this.handlers.set(handler.name, handler);

    if (handler.setup) {
      handler.setup();
    }
  }

  unregister(handlerName: string): void {
    const handler = this.handlers.get(handlerName);
    if (handler?.cleanup) {
      handler.cleanup();
    }
    this.handlers.delete(handlerName);
  }

  async executeHandlers(event: keyof ISocketHandler): Promise<void> {
    const promises: Promise<void>[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of this.handlers.values()) {
      const handlerMethod = handler[event];
      if (handlerMethod && typeof handlerMethod === 'function') {
        try {
          const result = handlerMethod();
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          logger.logError({
            message: `Error in socket handler ${handler.name} for event ${event}`,
            reason: 'Error in socket handler',
            error: error instanceof Error ? error.message : error,
          });
        }
      }
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  getHandler(name: string): ISocketHandler | undefined {
    return this.handlers.get(name);
  }

  getAllHandlers(): ISocketHandler[] {
    return Array.from(this.handlers.values());
  }
}

export const socketHandlerRegistry = new SocketHandlerRegistry();
