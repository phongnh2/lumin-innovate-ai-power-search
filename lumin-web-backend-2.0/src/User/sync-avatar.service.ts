import axios from 'axios';

import { OidcAvatarData } from './interfaces/user.interface';

export class SyncAvatar {
  private static async fetchImageBlob(url: string): Promise<OidcAvatarData | null> {
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return null;
    }

    const mimeType = imageRes.headers.get('Content-Type');
    const arrayBuffer = await imageRes.arrayBuffer();
    return {
      content: Buffer.from(arrayBuffer),
      mimeType,
    };
  }

  static async fetchGoogleAvatar(odicProviderToken: string): Promise<OidcAvatarData | null> {
    const { data } = await axios.get<{ photos: {
      url: string;
      default?: boolean;
    }[] }>('https://people.googleapis.com/v1/people/me', {
      params: {
        personFields: 'photos',
      },
      headers: {
        Authorization: `Bearer ${odicProviderToken}`,
      },
      timeout: 10000, // 10 seconds
    });

    const { default: isAvatarDefault, url } = data.photos[0];
    if (!isAvatarDefault) {
      return this.fetchImageBlob(url);
    }
    return null;
  }
}
