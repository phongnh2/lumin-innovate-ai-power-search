import {
  applyDecorators,
  CallHandler, ExecutionContext, Injectable,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { FlowContext, OpenFileFlowIdInterceptor, RequestQuery } from 'Common/interceptors/FlowId.interceptor';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

import { IOneDriveRedirectState } from './dtos/OpenOneDrive.dto';

@Injectable()
export class OpenOneDriveFlowIdInterceptor extends OpenFileFlowIdInterceptor {
  constructor(
    reflector: Reflector,
    environmentService: EnvironmentService,
    loggerService: LoggerService,
  ) {
    super(reflector, environmentService, loggerService);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    try {
      const flowCtx = this.getFlowContext(context);
      switch (flowCtx) {
        case FlowContext.Root: {
          this.setupFlowId(request, response);
          break;
        }
        case FlowContext.Redirect:
        case FlowContext.ImportDocument: {
          const query = request.query as RequestQuery & { state: string };
          const { flowId } = JSON.parse(query.state) as IOneDriveRedirectState;
          if (flowId) {
            this.setFlowId(request, response, flowId);
          } else {
            this.setFlowId(request, response, this.getFlowId());
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      this.onInterceptingError(error, request);
    }
    return next.handle();
  }
}

export function OpenOneDriveFlowId(flow: FlowContext) {
  return applyDecorators(
    SetMetadata('flow_context', flow),
    UseInterceptors(OpenOneDriveFlowIdInterceptor),
  );
}
