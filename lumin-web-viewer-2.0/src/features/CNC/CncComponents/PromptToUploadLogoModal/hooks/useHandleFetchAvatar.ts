/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';

import { avatar } from 'utils';

import { maximumAvatarSize } from 'constants/customConstant';
import { LOGO_DEV_API_KEY } from 'constants/urls';

import { buildLogoDevUrl } from '../helpers/buildLogoDevUrl';

type UseHandleFetchAvatarArgs = {
  emailDomain: string;
  suggestionAvatarRemoteId: string;
};

const useHandleFetchAvatar = ({ emailDomain, suggestionAvatarRemoteId }: UseHandleFetchAvatarArgs) => {
  const logoUrl = useMemo(() => {
    if (!emailDomain && !suggestionAvatarRemoteId) return null;
    if (suggestionAvatarRemoteId) return avatar.getAvatar(suggestionAvatarRemoteId);
    return buildLogoDevUrl(emailDomain, LOGO_DEV_API_KEY);
  }, [emailDomain, suggestionAvatarRemoteId]);

  const fetchAvatar = async (): Promise<File> => {
    if (!logoUrl) throw new Error('Logo URL is required');

    let response: Response;
    try {
      response = await fetch(logoUrl);
    } catch {
      throw new Error('Failed to fetch avatar');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch avatar: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    const imageBlob = await response.blob();
    if (imageBlob.size > maximumAvatarSize.ORGANIZATION) {
      throw new Error('Avatar size is too large');
    }

    const bitmap = await createImageBitmap(imageBlob);
    const w = bitmap.width;
    const h = bitmap.height;

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0);

    const jpegBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 1 });
    return new File([jpegBlob], 'avatar.jpg', { type: 'image/jpeg' });
  };

  return { logoUrl, fetchAvatar };
};

export default useHandleFetchAvatar;
