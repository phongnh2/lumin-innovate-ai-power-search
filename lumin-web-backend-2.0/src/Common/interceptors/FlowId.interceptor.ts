/* eslint-disable camelcase */
import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata, UseInterceptors, applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Observable } from 'rxjs';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import { IGoogleRedirectState } from 'OpenGoogle/dtos/OpenGoogle.dto';

export enum FlowContext {
  Root = 'root',
  Redirect = 'redirect',
  PostAuth = 'post_auth',
  ImportDocument = 'import_document',
}

export type RequestQuery = Record<string, string> & { flow_id?: string }

@Injectable()
export class OpenFileFlowIdInterceptor implements NestInterceptor {
  private readonly _cryptoKey: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    this._cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);
  }

  protected setFlowId(req: Request, res: Response, flowId: string): void {
    req.eventAttributes.commonAttributes.flowId = flowId;
    res.setHeader('X-Flow-Id', flowId);
  }

  protected getFlowId(initId?: string): string {
    return initId || nanoid();
  }

  protected getFlowContext = (context: ExecutionContext): FlowContext => {
    const flowCtx = this.reflector.get<FlowContext>(
      'flow_context',
      context.getHandler(),
    );
    if (!flowCtx) {
      throw new Error('Flow context is missing');
    }
    return flowCtx;
  };

  protected setupFlowId(request: Request, response: Response): void {
    const query = request.query as RequestQuery;
    const { flow_id: initId } = query;
    const flowId = this.getFlowId(initId);
    this.setFlowId(request, response, flowId);
  }

  protected onInterceptingError(error, request: Request) {
    this.loggerService.error({
      ...this.loggerService.getCommonHttpAttributes(request),
      stack: error.stack,
      error,
      errorCode: DefaultErrorCode.UNPROCESSABLE_ERROR,
      extraInfo: {
        interceptor: 'FlowIdInterceptor',
      },
    });
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
        case FlowContext.ImportDocument:
        case FlowContext.PostAuth: {
          const query = request.query as RequestQuery & { state: string };
          const queryState = JSON.parse(query.state) as IGoogleRedirectState;
          const { flowId } = JSON.parse(Utils.decryptData(queryState.signature, this._cryptoKey));
          if (flowId) {
            this.setFlowId(request, response, flowId as string);
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

export function FlowIdInterceptor(flow: FlowContext) {
  return applyDecorators(
    SetMetadata('flow_context', flow),
    UseInterceptors(OpenFileFlowIdInterceptor),
  );
}
