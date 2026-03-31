import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { Utils } from 'Common/utils/Utils';

import { SessionIntercomService } from 'Intercom/authentication/session-intercom.service';
import { X_INTERCOM_SOLUTION_HEADER, X_INTERCOM_TOKEN_HEADER } from 'Intercom/constants';

@Injectable()
export class SessionIntercomGuard implements CanActivate {
  constructor(
    private readonly sessionIntercomService: SessionIntercomService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { token, solution } = this.extractDataFromHeader(request.headers);

    if (!token) {
      throw HttpErrorException.Forbidden('Missing token or anonymousUserID');
    }

    const ipAddress = Utils.getIpRequest(request);

    const isValid = await this.sessionIntercomService.validateEphemeralToken(token, ipAddress, solution);
    if (!isValid) {
      throw HttpErrorException.Forbidden('Invalid or expired token');
    }

    return true;
  }

  private extractDataFromHeader(headers?: IncomingHttpHeaders): { token: string; solution: number } | undefined {
    const authHeaderValue = headers[CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER];
    if (!authHeaderValue) {
      return { token: null, solution: null };
    }

    const [type, token] = authHeaderValue.split(' ');
    const intercomSolution = Number(headers[X_INTERCOM_SOLUTION_HEADER]);

    if (Number.isNaN(intercomSolution)) {
      return { token: null, solution: null };
    }

    return {
      token: type === X_INTERCOM_TOKEN_HEADER ? token : null,
      solution: Number(intercomSolution),
    };
  }
}
