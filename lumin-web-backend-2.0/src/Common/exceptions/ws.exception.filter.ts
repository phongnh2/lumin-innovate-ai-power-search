import {
  Catch,
  ArgumentsHost,
  WsExceptionFilter,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { ISocket } from 'Gateway/Socket.interface';
import { LoggerService } from 'Logger/Logger.service';

@Catch(WsException, Error)
export class WebSocketExceptionFilter implements WsExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: WsException | Error, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<ISocket>();
    const data = host.switchToWs().getData();

    this.loggerService.error({
      error: exception,
      stack: exception.stack,
      message: exception.message,
      context: 'websocket-error',
      extraInfo: {
        socketId: client.id,
        eventData: data,
        userId: client.user?._id,
        ...this.getSocketContext(client),
      },
    });
  }

  private getSocketContext(client: ISocket): Record<string, unknown> {
    return {
      documentId: client.data?.document?.id,
      roomId: client.data?.document?.remoteId,
    };
  }
}
