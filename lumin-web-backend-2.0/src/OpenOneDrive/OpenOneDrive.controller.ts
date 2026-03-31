// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpStatus } from '@azure/msal-common';
import { InteractionRequiredAuthError } from '@azure/msal-node';
import {
  Body, Controller, Get, Header, Post, Query, Req, Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { FlowContext } from 'Common/interceptors/FlowId.interceptor';
import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { OneDriveHeaderSchema } from 'swagger/schemas';

import {
  IOneDriveImportDocumentDTO, IOneDriveQuery, IOpenOneDriveDto, IRedirectOneDriveDTO,
} from './dtos/OpenOneDrive.dto';
import { EventTrackingService } from './EventTracking/EventTracking.service';
import { OpenOneDriveFlowId } from './FlowId.interceptor';
import { OpenOneDriveErrorCode } from './interfaces/common.interface';
import { OpenOneDriveInterceptor } from './OpenOneDrive.interceptor';
import { OpenOneDriveService } from './OpenOneDrive.service';

@UsePipes(new ValidationPipeRest({ transform: true }))
@UseInterceptors(OpenOneDriveInterceptor)
@Controller('open/onedrive')
export class OpenOneDriveController {
  constructor(
    private readonly openOneDriveService: OpenOneDriveService,
    private readonly eventTrackingService: EventTrackingService,
  ) {}

  @ApiOperation({
    summary: 'Start OneDrive flow',
    description: 'Initiates the OneDrive authentication and file access flow. Redirects the user to the appropriate Microsoft authentication URL.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Microsoft authentication URL',
    headers: {
      Location: {
        description: 'URL to Microsoft authentication flow',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @Post('/')
  @Header('Cache-Control', 'no-store')
  startOneDriveFlow(@Req() request: Request, @Res() res: Response, @Body() oneDriveBody: IOpenOneDriveDto): void {
    const { items, userId: microsoftUserId } = oneDriveBody;
    const nextUrl = this.openOneDriveService.getNavigationUrl({
      items, userId: microsoftUserId, host: request.headers.host,
    });
    res.status(HttpStatus.REDIRECT as number).redirect(nextUrl);
  }

  @ApiOperation({
    summary: 'Initialize OneDrive flow',
    // eslint-disable-next-line max-len
    description: 'Initializes the OneDrive authentication and file access flow. Redirects the user to the Microsoft authentication URL or to an error page if initialization fails.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Microsoft authentication URL or error page',
    headers: OneDriveHeaderSchema,
  })
  @OpenOneDriveFlowId(FlowContext.Root)
  @Get('/init')
  @Header('Cache-Control', 'no-store')
  async initOneDriveFlow(@Req() request: Request, @Res() res: Response, @Query() query: IOneDriveQuery): Promise<void> {
    this.eventTrackingService.trackInitFlow(request);

    const flowId = request.eventAttributes?.commonAttributes.flowId;
    const { items, userId: microsoftUserId } = query.signature;
    try {
      const { nextUrl, cookies } = await this.openOneDriveService.handleInitOneDriveFlow({
        items, userId: microsoftUserId, request, flowId,
      });
      this.openOneDriveService.setCookie(res, cookies);
      res.status(HttpStatus.REDIRECT as number).redirect(nextUrl);
    } catch (e) {
      this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.UnhanledExeption, message: e.message, stack: e.stack });
      const technicalIssueUrl = await this.openOneDriveService.getTechnicalIssueUrl({
        host: request.headers.host,
        payload: {
          items, userId: microsoftUserId, flowId,
        },
      });
      res.status(HttpStatus.REDIRECT as number).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = res.getHeader('location') as string;
      this.eventTrackingService.trackPageView(request, redirectUrl);
    }
  }

  @ApiOperation({
    summary: 'Handle OneDrive OAuth redirect',
    // eslint-disable-next-line max-len
    description: 'Processes the redirect from Microsoft OAuth flow. Exchanges the authorization code for access tokens and redirects the user to the appropriate destination.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to application with access token or to error page',
    headers: OneDriveHeaderSchema,
  })
  @OpenOneDriveFlowId(FlowContext.Redirect)
  @Get('/redirect')
  async redirectOneDriveFlow(@Req() request: Request, @Res() response: Response, @Query() query: IRedirectOneDriveDTO): Promise<void> {
    this.eventTrackingService.trackGrantedScopes(request);
    try {
      const { nextUrl, cookies } = await this.openOneDriveService.handleRedirectionOneDriveFlow({
        query, request,
      });
      this.openOneDriveService.setCookie(response, cookies);
      response.status(HttpStatus.REDIRECT as number).redirect(nextUrl);
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        this.eventTrackingService.trackError(request, {
          code: OpenOneDriveErrorCode.InteractionRequired, message: e.message, stack: e.stack, claims: e.claims,
        });
      } else {
        this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.UnhanledExeption, message: e.message, stack: e.stack });
      }
      const technicalIssueUrl = await this.openOneDriveService.getTechnicalIssueUrl({ host: request.headers.host, state: query.state });
      response.status(HttpStatus.REDIRECT as number).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = response.getHeader('location') as string;
      this.eventTrackingService.trackPageView(request, redirectUrl);
    }
  }

  @ApiOperation({
    summary: 'Import document from OneDrive',
    description: 'Imports a selected document from OneDrive into the application. Uses the state parameter to identify the session and document.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to application with imported document or to error page',
    headers: OneDriveHeaderSchema,
  })
  @OpenOneDriveFlowId(FlowContext.ImportDocument)
  @Get('/import-document')
  async importDocument(@Req() request: Request, @Res() response: Response, @Query() query: IOneDriveImportDocumentDTO): Promise<void> {
    try {
      const { nextUrl, cookies } = await this.openOneDriveService.handleImportFileFromOneDrive({ state: query.state, request });
      this.openOneDriveService.setCookie(response, cookies);
      response.status(HttpStatus.REDIRECT as number).redirect(nextUrl);
    } catch (e) {
      this.eventTrackingService.trackError(request, { code: OpenOneDriveErrorCode.UnhanledExeption, message: e.message, stack: e.stack });
      const technicalIssueUrl = await this.openOneDriveService.getTechnicalIssueUrl({ host: request.headers.host, state: query.state });
      response.status(HttpStatus.REDIRECT as number).redirect(technicalIssueUrl);
    } finally {
      const redirectUrl = response.getHeader('location') as string;
      this.eventTrackingService.trackPageView(request, redirectUrl);
    }
  }
}
