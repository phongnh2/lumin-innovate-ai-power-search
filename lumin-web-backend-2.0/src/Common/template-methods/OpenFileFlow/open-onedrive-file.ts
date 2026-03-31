import axios from 'axios';

import { IOneDriveFile } from 'OpenOneDrive/interfaces/File.interface';

import { InputType, OpenFileBase } from './open-file-base';

export class OpenOneDriveFile extends OpenFileBase {
  public async getRemoteFile(
    input: InputType,
  ): Promise<{ file: IOneDriveFile; error?: Error }> {
    const { remoteFilePath, accessToken } = input.extra;
    const { file, error } = await axios
      .get(remoteFilePath, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => ({ file: res.data, error: null }))
      .catch((err) => ({ file: null, error: err }));
    return { file, error };
  }

  public getWrongAccountUrl({
    email,
    host,
    url,
    from,
  }: {
    host: string;
    url: string;
    email: string;
    from?: string;
  }) {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: '/open/file/wrong-account',
      host: origins.viewer,
      query: {
        email,
        change_account_url: encodeURIComponent(url),
        ...{ from },
      },
    });
  }

  getAnonymousViewerUrl({
    remoteId,
    searchParams,
    host,
  }: {
    remoteId: string;
    searchParams: URLSearchParams;
    host: string;
  }): string {
    const origins = this.getLuminOrigins(host);
    return this.getUrl({
      path: `/viewer/guest/${remoteId}?${searchParams.toString()}`,
      host: origins.viewer,
    });
  }
}
