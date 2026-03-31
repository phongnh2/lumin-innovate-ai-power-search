/* eslint-disable unused-imports/no-unused-vars */
import { drive, drive_v3 as DriveV3 } from '@googleapis/drive';

import { LoginService } from 'graphql.schema';

import { InputType, OpenFileBase } from './open-file-base';

export class OpenGoogleFile extends OpenFileBase {
  public async getRemoteFile(input: InputType): Promise<{
    file: DriveV3.Schema$File,
    error?: Error;
  }> {
    const { extra: { accessToken, fileId, options = {} }, oauth2Client } = input;
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
    const driveInstance = drive({
      version: 'v3',
      auth: oauth2Client as any,
    });
    try {
      const fileRes = await driveInstance.files.get({
        fileId,
        ...options,
      });
      return {
        file: fileRes.data,
      };
    } catch (e) {
      return {
        error: new Error(e.message as string),
        file: null,
      };
    }
  }

  public getWrongAccountUrl({
    email, host, url, from,
  }:{host: string, url: string, email: string, from?: string}) {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: '/open/google/wrong-account',
      host: origins.viewer,
      query: {
        email,
        change_account_url: encodeURIComponent(url),
        ...{ from },
      },
    });
  }

  getAnonymousViewerUrl({
    remoteId, hintLoginService, host, from,
  }: {remoteId: string, hintLoginService: LoginService, host: string, from?: string}): string {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: `/viewer/guest/${remoteId}?hint-login-service=${hintLoginService}${from ? `&from=${from}` : ''}`,
      host: origins.viewer,
    });
  }
}
