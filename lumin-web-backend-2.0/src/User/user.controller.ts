/* eslint-disable no-await-in-loop */
import {
  defaultNackErrorHandler, Nack, RabbitSubscribe, SubscribeResponse,
} from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Body,
  Header,
  Res,
  Query,
  Req,
  Inject,
  forwardRef,
  UsePipes,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation, ApiBody, ApiResponse, ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { capitalize } from 'lodash';
import { Readable } from 'stream';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode, ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { SYNC_OIDC_AVATAR_BASE_DELAY_MS, SYNC_OIDC_AVATAR_MAX_RETRIES } from 'Common/constants/UserConstants';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { ServerErrorException } from 'Common/errors/ServerErrorException';
import { Utils } from 'Common/utils/Utils';
import { GrpcValidationPipe } from 'Common/validator/grpc.validator';

import { AwsService } from 'Aws/aws.service';

import { AuthService } from 'Auth/auth.service';
import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { LoginService } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { EXCHANGE_KEYS, QUEUES, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import {
  UploadMobileFeedbackFilesResponse,
  FilesUploadDto,
  UserLocationResponse,
  WorkspaceConfigurationResponse,
  AcceptNewTermsOfUseResponse,
} from 'swagger/schemas';
import {
  IGetStaticToolUploadWorkspacePayload, User, IUserLocation,
} from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';
import { SyncAvatarEventAttributes, SyncAvatarEventMetrics } from 'UserTracking/sync-avatar-event';

import { ChangeUserLoginServiceInput } from './dtos/changeUserLoginService.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly redisService: RedisService,
    private readonly loggerService: LoggerService,
    private readonly organizationService: OrganizationService,
    private readonly authService: AuthService,
    private readonly rabbitMQService: RabbitMQService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly messageGateway: EventsGateway,
  ) { }

  @ApiOperation({
    summary: 'Get user avatar',
    description: 'Retrieve a user\'s avatar image from S3 storage using the remote ID.',
  })
  @ApiQuery({
    name: 'remoteId',
    description: 'The remote ID of the avatar image',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar image returned successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Get('getAvatar')
  @Header('cache-control', 'public, max-age=315360000')
  async getAvatar(@Res() response, @Query() query) {
    const { remoteId } = query;
    if (!remoteId) {
      throw HttpErrorException.NotAcceptable('RemoteId is required');
    }
    const bucket = this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET);
    await this.awsService.s3Instance().headObject({
      Key: remoteId,
      Bucket: bucket,
    });
    const stream = (await this.awsService.s3Instance().getObject({
      Key: remoteId,
      Bucket: bucket,
    }));
    response.setHeader('content-type', stream.ContentType || 'application/octet-stream');
    return (stream.Body as Readable).pipe(response);
  }

  @ApiOperation({
    summary: 'Get signature file',
    description: 'Retrieve a signature file from S3 storage using the remote ID. Supports both profile and document bucket locations.',
  })
  @ApiQuery({
    name: 'remoteId',
    description: 'Remote ID of the signature file',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Signature file returned successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Get('getSignature')
  @Header('content-type', 'application/octet-stream')
  // eslint-disable-next-line unused-imports/no-unused-vars
  async getSignature(@Body() body, @Res() response, @Query() query, @Req() request) {
    this.loggerService.info({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...this.loggerService.getCommonAttributes(request),
      context: 'cpu_bound',
      extraInfo: {
        task: 'getSignature',
      },
    });
    let { remoteId } = query;
    let bucket = this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET);
    if (remoteId.includes('http')) {
      const splited = remoteId.split('amazonaws.com/');
      remoteId = splited[splited.length - 1];
      bucket = this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET);
    }
    await this.awsService.s3Instance().headObject({
      Key: remoteId,
      Bucket: bucket,
    });
    const stream = (await this.awsService.s3Instance().getObject({
      Key: remoteId,
      Bucket: bucket,
    })).Body as Readable;
    return stream.pipe(response);
  }

  @ApiOperation({
    summary: 'Get user location',
    description: 'Retrieves the user\'s location information based on Cloudflare headers including city, region, and country code.',
  })
  @ApiResponse({
    status: 200,
    description: 'Location information retrieved successfully',
    type: UserLocationResponse,
  })
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.ANONYMOUS_USER_ID)
  @Get('user-location')
  getLocation(@Req() request): IUserLocation {
    const regionName = request.headers[CommonConstants.CF_REGION];
    const countryCode = request.headers[CommonConstants.CF_IPCOUNTRY];
    const city = request.headers[CommonConstants.CF_IPCITY];
    return {
      city,
      regionName,
      countryCode,
    };
  }

  @ApiOperation({
    summary: 'Upload mobile feedback files',
    description: 'Upload multiple files as attachments for mobile feedback. Files are validated and stored in S3.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FilesUploadDto,
    description: 'Array of files to upload as feedback attachments',
  })
  @ApiResponse({
    status: 200,
    description: 'Files uploaded successfully',
    type: UploadMobileFeedbackFilesResponse,
  })
  @UseGuards(RestAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Post('uploadMobileFeedbackFiles')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMobileFeedbackFiles(@UploadedFiles() files) {
    const validateFile = this.userService.verifyFeedbackFile(files as any[]);
    if (validateFile.error) {
      throw validateFile.error;
    }
    return Promise.all(files.map((file) => this.awsService.uploadFeedbackAttachmentToS3(file)));
  }

  @GrpcMethod('WorkerService', 'LogPricingUserMigration')
  async logPricingUserMigration(): Promise<void> {
    try {
      const result = await this.userService.logPricingUserMigration();
      if (result.totalUser) {
        this.loggerService.info({
          context: 'LogPricingUserMigration',
          extraInfo: {
            ...result,
          },
        });
      }
    } catch (e) {
      throw GrpcErrorException.ApplicationError(
        ServerErrorException.Internal('LogPricingUserMigration', DefaultErrorCode.INTERNAL_SERVER_ERROR, { error: e }),
      );
    }
  }

  @GrpcMethod('WorkerService', 'GetUserExtraInfoByEmail')
  async GetUserExtraInfoByEmail(data): Promise<{ hasFinishOnboardingFlow: boolean }> {
    const { email } = data as { email: string };
    if (!email) {
      throw GrpcErrorException.InvalidArgument('Email is required', ErrorCode.Common.INVALID_INPUT);
    }
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.Common.NOT_FOUND);
    }
    const org = await this.organizationService.findOneOrganization({ ownerId: user._id });

    return {
      hasFinishOnboardingFlow: Boolean(org) || user.payment.type === PaymentPlanEnums.PROFESSIONAL,
    };
  }

  @ApiOperation({
    summary: 'Get static tool upload workspace',
    description: 'Retrieves the workspace configuration for static tool uploads for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace configuration retrieved successfully',
    type: WorkspaceConfigurationResponse,
  })
  @UseGuards(RestAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Get('get-static-tool-upload-workspace')
  async getStaticToolUploadWorkspace(@Req() request): Promise<IGetStaticToolUploadWorkspacePayload> {
    const { user } = request;

    return this.userService.getStaticToolUploadWorkspace(user as User);
  }

  @GrpcMethod('WorkerService', 'ChangeUsersLoginService')
  @UsePipes(GrpcValidationPipe)
  async changeUsersLoginService(input: ChangeUserLoginServiceInput): Promise<void> {
    if (input.domain) {
      await this.userService.changeLoginServiceOfUsersWithDomain(input.domain);
    }
    if (input.individual) {
      await this.userService.changeIndividualLoginService(input.individual);
    }
    if (input.group) {
      await this.userService.changeGroupLoginService(input.group);
    }
  }

  @GrpcMethod('WorkerService', 'MigrateUsersPassword')
  async migrateUsersPassword(): Promise<void> {
    await this.userService.migrateUsersPassword();
  }

  @GrpcMethod('UserService', 'AddSyncOidcAvatarTask')
  async addSyncOidcAvatarTask(data: { email: string }): Promise<void> {
    // need delay to link the user with the identityId in the database
    return new Promise((resolve) => {
      setTimeout(() => {
        const { email } = data;
        this.userService.addSyncOidcAvatarTask(email);
        resolve();
      }, 500);
    });
  }

  @GrpcMethod('UserService', 'GetTeamMembershipOfUserByOrg')
  async getTeamMembershipOfUserByOrg(data: { userId: string, orgId: string }): Promise<{ teamIds: string[] }> {
    const { userId, orgId } = data;
    const teamIds = await this.userService.getTeamMembershipOfUserByOrg(userId, orgId);
    return { teamIds };
  }

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_WEB_SYNC_OIDC_AVATAR,
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      messageTtl: 3600000, // 1 hour
    },
  })
  async handleSyncOidcAvatarRequest(message: { email: string; retryCount?: number }): Promise<SubscribeResponse> {
    const { email, retryCount = 0 } = message;
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw HttpErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    const {
      _id, loginService, identityId, metadata,
    } = user;
    if (
      ![LoginService.GOOGLE, LoginService.DROPBOX, LoginService.MICROSOFT, LoginService.APPLE, LoginService.XERO].includes(loginService)
      || metadata.hasSyncedOidcAvatar
    ) {
      return new Nack();
    }

    if (!identityId) {
      if (retryCount >= SYNC_OIDC_AVATAR_MAX_RETRIES) {
        this.loggerService.warn({
          context: this.handleSyncOidcAvatarRequest.name,
          message: `Discarding sync OIDC avatar message after ${retryCount} retries - user has no identityId`,
          extraInfo: { userId: _id, retryCount },
        });
        return new Nack();
      }

      const delayMs = SYNC_OIDC_AVATAR_BASE_DELAY_MS * (2 ** retryCount);
      this.loggerService.info({
        context: this.handleSyncOidcAvatarRequest.name,
        message: 'Scheduling retry for sync OIDC avatar with exponential backoff',
        extraInfo: { userId: _id, retryCount: retryCount + 1, delayMs },
      });

      // Publish to delay queue with per-message TTL for exponential backoff.
      // The message sits in the delay queue until expiration, then RabbitMQ dead-letters it back to the main queue for processing.
      // This achieves a delayed retry without blocking the consumer.
      this.rabbitMQService.publishWithExpiration({
        exchange: EXCHANGE_KEYS.LUMIN_WEB_USER,
        routingKey: ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DELAY,
        data: { email, retryCount: retryCount + 1 },
        expirationMs: delayMs,
      });
      return new Nack();
    }

    const { result, executionTimeMs } = await Utils.measureExecutionTime({
      fn: async () => this.userService.handleSyncOidcAvatar(identityId, loginService),
    });

    const { avatarSize, status } = result;
    const eventAttributes: SyncAvatarEventAttributes = {
      LuminUserId: _id,
      status,
      source: capitalize(user.loginService),
      avatarSize: avatarSize ? avatarSize / (1024 * 1024) : undefined,
    };
    const eventMetrics: SyncAvatarEventMetrics = {
      elapsedTimeMS: executionTimeMs,
    };
    this.userService.trackAvatarSyncedEvent(eventAttributes, eventMetrics);
    this.loggerService.info({
      context: this.userService.handleSyncOidcAvatar.name,
      extraInfo: { ...eventAttributes, ...eventMetrics },
    });
    return new Nack();
  }

  @ApiOperation({
    summary: 'Accept new terms of use',
    description: 'Accepts the new terms of use for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Terms of use accepted successfully',
    type: AcceptNewTermsOfUseResponse,
  })
  @UseGuards(RestAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Post('accept-new-terms-of-use')
  async acceptNewTermsOfUse(@Req() request): Promise<{ termsOfUseVersion: string }> {
    const user = request.user as User;

    const updatedUser = await this.userService.acceptNewTermsOfUse(user._id);
    return {
      termsOfUseVersion: updatedUser.metadata.acceptedTermsOfUseVersion,
    };
  }
}
