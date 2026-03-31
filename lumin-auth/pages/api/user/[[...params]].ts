import bodyParser from 'body-parser';
import { fileTypeFromBuffer } from 'file-type';
import { isEmpty } from 'lodash';
import type { PageConfig } from 'next';
import { createHandler, Post, HttpCode, InternalServerErrorException, Get, Req, Catch, Patch, Body, ValidationPipe, UseMiddleware } from 'next-api-decorators';

import { LoggerScope } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import type { TIdentityRequest } from '@/interfaces/common';
import { ChangeNameDTO } from '@/interfaces/dto/user.dto';
import { ForceLogoutType } from '@/interfaces/user';
import { storage } from '@/lib/aws/s3';
import { exceptionHandler } from '@/lib/exceptions/exceptionHandler';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { identityApi } from '@/lib/ory';
import { AuthGuard, MobileAuthGuard } from '@/middlewares';
import RateLimitGuard from '@/middlewares/RateLimitGuard';
import { IdentityOutput } from '@/proto/auth/kratos/Identity';
import { CurrentUserResponse } from '@/proto/auth/user/CurrentUserResponse';
import { TeamAndOrganizationResponse } from '@/proto/auth/user/TeamAndOrganizationResponse';
import { bufferAvatar, avatarFilename, validateFileType } from '@/utils/avatar.utils';

export const config: PageConfig = {
  api: {
    bodyParser: false
  }
};

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/user-path.yaml
 - docs/swagger/schemas/user-schema.yaml
*/
@RateLimitGuard()
@Catch(exceptionHandler)
export class UserHandler {
  @AuthGuard()
  @Post('/delete-account')
  @HttpCode(200)
  async handleDeleteAccount(@Req() request: TIdentityRequest): Promise<CurrentUserResponse> {
    const { identity } = request;
    const deletedAccountResponse = await grpc.user.deleteAccount({ identityId: identity?.id });
    if (!deletedAccountResponse) {
      throw new InternalServerErrorException();
    }
    const { error, user } = deletedAccountResponse;
    if (!isEmpty(error)) {
      throw HttpErrorException.BadRequest({ message: error.message || '', code: error.code });
    }
    return user as CurrentUserResponse;
  }

  @AuthGuard()
  @Get('/get-current-user')
  @HttpCode(200)
  async handleGetCurrentUser(@Req() request: TIdentityRequest): Promise<CurrentUserResponse | undefined> {
    const { identity } = request;
    return await grpc.user.getCurrentUser({ identityId: identity.id });
  }

  @AuthGuard()
  @Get('/get-organization-team-owner')
  @HttpCode(200)
  async handleGetOrganizationTeamOwner(@Req() request: TIdentityRequest): Promise<TeamAndOrganizationResponse> {
    const { identity } = request;
    const teamAndOrganizationResponse = await grpc.user.getTeamAndOrganizationOwner({ identityId: identity.id });
    if (!teamAndOrganizationResponse) {
      throw new InternalServerErrorException();
    }
    if (teamAndOrganizationResponse?.error) {
      throw HttpErrorException.BadRequest({ message: teamAndOrganizationResponse.error.message || '', code: teamAndOrganizationResponse.error.code });
    }
    return teamAndOrganizationResponse;
  }

  @AuthGuard()
  @Patch('/remove-avatar')
  @HttpCode(204)
  async handleRemoveAvatar(@Req() req: TIdentityRequest): Promise<void> {
    const { identity } = req;
    if (identity.traits.avatarRemoteId) {
      storage.removeFromProfiles(identity.traits.avatarRemoteId).catch(err => {
        logger.error({ err: err, message: JSON.stringify(err), scope: LoggerScope.ERROR.REMOVE_AVATAR, meta: logger.getCommonHttpAttributes(req) });
      });
    }

    await Promise.all([identityApi.updateAvatarRemoteId(identity.id, ''), grpc.user.removeProfileAvatar({ identityId: identity.id })]);
    grpc.contractAuthService.syncUpAccountSetting({
      identityId: identity.id,
      type: 'removeAvatar'
    });
  }

  @AuthGuard()
  @Patch('/upload-avatar')
  @HttpCode(200)
  async handleUploadAvatar(@Req() req: TIdentityRequest): Promise<{ remotePath: string }> {
    const { identity } = req;
    const { avatarBuffer, error } = await bufferAvatar(req);
    if (error || !avatarBuffer) {
      throw error;
    }

    const filetype = await fileTypeFromBuffer(new Uint8Array(avatarBuffer));

    if (!filetype) {
      throw HttpErrorException.BadRequest({ message: CommonErrorMessage.Avatar.FILE_TYPE_NOT_EXIST, code: CommonErrorMessage.Avatar.FILE_TYPE_NOT_EXIST });
    }
    const valid = validateFileType(filetype.mime);
    if (!valid) {
      throw HttpErrorException.BadRequest({ message: CommonErrorMessage.Avatar.VALID_TYPE, code: ErrorCode.Avatar.VALID_TYPE });
    }

    const remotePath = await storage.uploadToProfiles(avatarBuffer, avatarFilename(filetype), filetype?.mime);
    if (identity.traits.avatarRemoteId) {
      storage.removeFromProfiles(identity.traits.avatarRemoteId).catch(err => {
        logger.error({ err: err, message: JSON.stringify(err), meta: logger.getCommonHttpAttributes(req), scope: LoggerScope.ERROR.REMOVE_AVATAR });
      });
    }

    await Promise.all([
      identityApi.updateAvatarRemoteId(identity.id, remotePath),
      grpc.user.updateProfileAvatar({
        identityId: identity.id,
        avatarRemoteId: remotePath
      })
    ]);
    grpc.contractAuthService.syncUpAccountSetting({
      identityId: identity.id,
      type: 'uploadAvatar'
    });
    return {
      remotePath
    };
  }

  @MobileAuthGuard()
  @Patch('/upload-avatar-mobile')
  @HttpCode(200)
  async handleUploadAvatarForMobile(@Req() req: TIdentityRequest): Promise<{ remotePath: string }> {
    const { user } = req;
    const identity = await identityApi.getIdentity({ identityId: user?.identityId as string });
    const { avatarBuffer, error } = await bufferAvatar(req);
    if (error || !avatarBuffer) {
      throw error;
    }

    const filetype = await fileTypeFromBuffer(new Uint8Array(avatarBuffer));

    if (!filetype) {
      throw HttpErrorException.BadRequest({ message: CommonErrorMessage.Avatar.FILE_TYPE_NOT_EXIST, code: CommonErrorMessage.Avatar.FILE_TYPE_NOT_EXIST });
    }
    const valid = validateFileType(filetype.mime);
    if (!valid) {
      throw HttpErrorException.BadRequest({ message: CommonErrorMessage.Avatar.VALID_TYPE, code: ErrorCode.Avatar.VALID_TYPE });
    }

    const remotePath = await storage.uploadToProfiles(avatarBuffer, avatarFilename(filetype), filetype?.mime);
    if (identity.traits.avatarRemoteId) {
      storage.removeFromProfiles(identity.traits.avatarRemoteId).catch(err => {
        logger.error({ err: err, message: JSON.stringify(err), meta: logger.getCommonHttpAttributes(req), scope: LoggerScope.ERROR.REMOVE_AVATAR });
      });
    }

    await Promise.all([
      identityApi.updateAvatarRemoteId(identity.id, remotePath),
      grpc.user.updateProfileAvatar({
        identityId: identity.id,
        avatarRemoteId: remotePath
      }),
      grpc.contractAuthService.syncUpAccountSetting({
        identityId: identity.id,
        type: 'uploadAvatar'
      })
    ]);
    return {
      remotePath
    };
  }

  @MobileAuthGuard()
  @Patch('/remove-avatar-mobile')
  @HttpCode(200)
  async handleRemoveAvatarForMobile(@Req() req: TIdentityRequest): Promise<{ message: string }> {
    const { user } = req;
    const identity = await identityApi.getIdentity({ identityId: user?.identityId as string });

    if (identity.traits.avatarRemoteId) {
      storage.removeFromProfiles(identity.traits.avatarRemoteId).catch(err => {
        logger.error({ err: err, message: JSON.stringify(err), meta: logger.getCommonHttpAttributes(req), scope: LoggerScope.ERROR.REMOVE_AVATAR });
      });
    }

    await Promise.all([
      identityApi.updateAvatarRemoteId(identity.id, ''),
      grpc.user.updateProfileAvatar({
        identityId: identity.id,
        avatarRemoteId: ''
      })
    ]);
    return {
      message: 'Remove user avatar'
    };
  }

  @MobileAuthGuard()
  @Patch('/change-name-mobile')
  @UseMiddleware(bodyParser.json())
  @HttpCode(200)
  async changeNameMobile(@Req() request: TIdentityRequest, @Body(ValidationPipe) body: ChangeNameDTO): Promise<{ message: string }> {
    const { user } = request;
    const identity = await identityApi.getIdentity({ identityId: user?.identityId as string });
    await identityApi.updateIdentity({
      identityId: identity.id,
      traits: {
        ...identity.traits,
        name: body.newName
      }
    });
    grpc.contractAuthService.syncUpAccountSetting({
      identityId: identity.id,
      type: 'changeName'
    });
    grpc.kratos.handleKratosSyncUpSettingsDataCallback({
      identity: { ...identity, traits: { ...identity.traits, name: body.newName } } as unknown as IdentityOutput
    });
    return {
      message: 'Change name success'
    };
  }

  @AuthGuard()
  @Post('/confirm-link-account')
  @HttpCode(200)
  async confirmLinkAccount(@Req() request: TIdentityRequest): Promise<void> {
    const { identity } = request;
    grpc.contractAuthService.syncUpAccountSetting({
      identityId: identity.id,
      type: ForceLogoutType.CHANGE_LOGIN_SERVICE,
      extraData: {
        loginService: identity.traits.loginService
      }
    });

    // Revoke all sessions and notify all connected clients via socket
    grpc.kratos.handleForceLogout({ id: identity.id });
  }

  @AuthGuard()
  @Post('/update-identityId')
  @HttpCode(200)
  async updateIdentityId(@Req() request: TIdentityRequest): Promise<void> {
    const { identity } = request;
    await grpc.user.updateUserProperties({ identityId: identity.id, email: identity.traits.email });
  }
}

export default createHandler(UserHandler);
