/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  UseInterceptors,
  Get,
  Header,
  Query,
  Req,
  Res,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { FlowIdInterceptor, FlowContext } from 'Common/interceptors/FlowId.interceptor';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { IGoogleQueryDto, IGoogleRedirectQueryDto } from 'OpenGoogle/dtos/OpenGoogle.dto';
import { EventTrackingService } from 'OpenGoogle/EventTracking.service';
import { TGoogleTokenPayload, TSignaturePayload } from 'OpenGoogle/interfaces/OpenGoogle.interface';
import { OpenGoogleService } from 'OpenGoogle/OpenGoogle.service';
import { GoogleHeaderSchema } from 'swagger/schemas';

import { InvalidMimeType, OpenGoogleErrorCode } from './interfaces/OpenGoogleError.interface';
import { OpenGoogleInterceptor } from './OpenGoogle.interceptor';

@UsePipes(new ValidationPipeRest({ transform: true }))
@UseInterceptors(OpenGoogleInterceptor)
@Controller('open/google')
export class OpenGoogleController {
  constructor(
    private readonly openGoogleService: OpenGoogleService,
    private readonly eventTrackingService: EventTrackingService,
  ) {}

  @ApiOperation({
    summary: 'Initialize Google Drive flow',
    // eslint-disable-next-line max-len
    description: 'Initiates the Google authentication and file access flow. Redirects the user to Google authentication if needed or directly to the file if already authenticated.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google authentication or directly to the file',
    headers: GoogleHeaderSchema,
  })
  @FlowIdInterceptor(FlowContext.Root)
  @Get('/')
  @Header('Cache-Control', 'no-store')
  async initGoogleFlow(@Req() req: Request, @Res() res: Response, @Query() query: IGoogleQueryDto): Promise<void> {
    const flowId = req.eventAttributes?.commonAttributes.flowId;
    try {
      this.eventTrackingService.trackInitFlow(req);
      const { googleAccessTokenCookie } = this.openGoogleService.loadGoogleCookieNames();
      const googleTokenCookie = req.cookies[googleAccessTokenCookie];
      const accessTokenData: TGoogleTokenPayload = googleTokenCookie ? JSON.parse(googleTokenCookie) : null;
      const { statusCode, nextUrl, cookies } = await this.openGoogleService.initGoogleFlowHandler({
        anonymousUserId: req.anonymousUserId,
        query,
        accessTokenData,
        headers: req.headers,
        flowId,
        request: req,
      });
      this.openGoogleService.setCookie(res, cookies);
      res.status(statusCode).redirect(nextUrl);
    } catch (e) {
      this.eventTrackingService.trackUnhandledError(req, e);
      const technicalIssueUrl = this.openGoogleService.getTechnicalIssueUrl(req.headers.host, req.anonymousUserId, flowId, query.state);
      res.status(HttpStatus.SEE_OTHER).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = res.getHeader('location') as string;
      this.eventTrackingService.trackPageView(req, redirectUrl);
    }
  }

  @ApiOperation({
    summary: 'Handle Google OAuth redirect',
    // eslint-disable-next-line max-len
    description: 'Processes the redirect from Google OAuth flow. Exchanges the authorization code for access tokens and redirects the user to the appropriate destination.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to application with access token or to file viewer',
    headers: GoogleHeaderSchema,
  })
  @FlowIdInterceptor(FlowContext.Redirect)
  @Get('/redirect')
  @Header('Cache-Control', 'no-store')
  async redirectOpenGoogle(@Req() req: Request, @Res() res: Response, @Query() query: IGoogleRedirectQueryDto): Promise<void> {
    const flowId = req.eventAttributes?.commonAttributes.flowId;
    try {
      const { googleAccessTokenCookie } = this.openGoogleService.loadGoogleCookieNames();
      const googleTokenCookie = req.cookies[googleAccessTokenCookie];
      const accessTokenData: TGoogleTokenPayload = googleTokenCookie ? JSON.parse(googleTokenCookie) : null;
      const { statusCode, nextUrl, cookies } = await this.openGoogleService.redirectOpenGoogleHandler({
        anonymousUserId: req.anonymousUserId,
        query,
        accessTokenData,
        headers: req.headers,
        request: req,
      });
      this.openGoogleService.setCookie(res, cookies);
      res.status(statusCode).redirect(nextUrl);
    } catch (e) {
      this.eventTrackingService.trackUnhandledError(req, e);
      const { signature } = query.state;
      const { state } = this.openGoogleService.decryptData<TSignaturePayload>(signature);
      const technicalIssueUrl = this.openGoogleService.getTechnicalIssueUrl(req.headers.host, req.anonymousUserId, flowId, state);
      res.status(HttpStatus.SEE_OTHER).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = res.getHeader('location') as string;
      this.eventTrackingService.trackPageView(req, redirectUrl);
    }
  }

  @ApiOperation({
    summary: 'Post-authentication processing',
    description: 'Handles post-authentication actions such as file access, validation, and processing after successful Google authentication.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to file viewer or document processor',
    headers: GoogleHeaderSchema,
  })
  @FlowIdInterceptor(FlowContext.PostAuth)
  @Get('/post-auth')
  @Header('Cache-Control', 'no-store')
  async postAuth(@Req() req: Request, @Res() res: Response, @Query() query: IGoogleRedirectQueryDto): Promise<void> {
    const flowId = req.eventAttributes?.commonAttributes.flowId;
    try {
      const { googleAccessTokenCookie } = this.openGoogleService.loadGoogleCookieNames();
      const googleTokenCookie = req.cookies[googleAccessTokenCookie];
      const accessTokenData: TGoogleTokenPayload = googleTokenCookie ? JSON.parse(googleTokenCookie) : null;
      const { nextUrl, statusCode, cookies } = await this.openGoogleService.handlePostAuthentication({
        accessTokenData,
        anonymousUserId: req.anonymousUserId,
        state: query.state,
        headers: req.headers,
        request: req,
      });
      this.openGoogleService.setCookie(res, cookies);
      res.redirect(statusCode, nextUrl);
    } catch (e) {
      if (e.code === OpenGoogleErrorCode.INVALID_MIMETYPE) {
        const invalidMimeTypeError = e as InvalidMimeType;
        this.eventTrackingService.trackError(req, {
          message: invalidMimeTypeError.message, code: invalidMimeTypeError.code,
        }, invalidMimeTypeError.metadata);
        res.redirect(HttpStatus.SEE_OTHER, this.openGoogleService.getWrongMimeTypeUrl(req.headers.host, invalidMimeTypeError.metadata));
        return;
      }
      this.eventTrackingService.trackUnhandledError(req, e);
      const { signature } = query.state;
      const { state } = this.openGoogleService.decryptData<TSignaturePayload>(signature);
      const technicalIssueUrl = this.openGoogleService.getTechnicalIssueUrl(req.headers.host, req.anonymousUserId, flowId, state);
      res.status(HttpStatus.SEE_OTHER).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = res.getHeader('location') as string;
      this.eventTrackingService.trackPageView(req, redirectUrl);
    }
  }
}
