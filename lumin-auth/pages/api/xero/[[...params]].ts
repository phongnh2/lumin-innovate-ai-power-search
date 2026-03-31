import bodyParser from 'body-parser';
import jwtDecode from 'jwt-decode';
import type { PageConfig } from 'next';
import { Body, Catch, createHandler, HttpCode, InternalServerErrorException, Post, UseMiddleware, ValidationPipe } from 'next-api-decorators';

import { environment } from '@/configs/environment';
import { LoggerScope } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { exceptionHandler } from '@/lib/exceptions/exceptionHandler';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import { logger } from '@/lib/logger';
import RateLimitGuard from '@/middlewares/RateLimitGuard';

export const config: PageConfig = {
  api: {
    bodyParser: false
  }
};

interface UserInfoRequest {
  code: string;
  state: string;
  redirect_uri: string;
}

interface XeroTokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface XeroIdToken {
  email: string;
  given_name?: string;
  family_name?: string;
}

interface UserInfoResponse {
  email: string;
  given_name?: string;
  family_name?: string;
}

@RateLimitGuard()
@Catch(exceptionHandler)
class XeroHandler {
  @Post('/user-info')
  @UseMiddleware(bodyParser.json())
  @HttpCode(200)
  async handleUserInfo(@Body(ValidationPipe) body: UserInfoRequest): Promise<UserInfoResponse> {
    const { code, state, redirect_uri } = body;

    if (!code || !state || !redirect_uri) {
      throw HttpErrorException.BadRequest({
        message: 'Missing required parameters: code, state, or redirect_uri',
        code: ErrorCode.Auth.TOKEN_EXPIRED
      });
    }

    const clientId = environment.public.xero.clientId;
    const clientSecret = environment.internal.xero.clientSecret;

    if (!clientId || !clientSecret) {
      logger.error({
        err: new Error('Xero OAuth credentials not configured'),
        message: 'Xero OAuth credentials not configured',
        scope: LoggerScope.ERROR.XERO_EXCEPTION
      });
      throw new InternalServerErrorException();
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error({
        err: new Error('Failed to exchange Xero authorization code'),
        message: 'Failed to exchange Xero authorization code',
        scope: LoggerScope.ERROR.XERO_EXCEPTION,
        meta: { status: tokenResponse.status, error: errorText }
      });
      throw HttpErrorException.BadRequest({
        message: 'Failed to exchange authorization code'
      });
    }

    const tokenData = (await tokenResponse.json()) as XeroTokenResponse;

    let userInfo: XeroIdToken;
    try {
      userInfo = jwtDecode<XeroIdToken>(tokenData.id_token);
    } catch (error) {
      logger.error({
        err: error instanceof Error ? error : new Error(String(error)),
        message: 'Failed to decode Xero id_token',
        scope: LoggerScope.ERROR.XERO_EXCEPTION,
        meta: { error: error instanceof Error ? error.message : String(error) }
      });
      throw HttpErrorException.BadRequest({
        message: 'Failed to decode id_token'
      });
    }

    return {
      email: userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name
    };
  }
}

export default createHandler(XeroHandler);
