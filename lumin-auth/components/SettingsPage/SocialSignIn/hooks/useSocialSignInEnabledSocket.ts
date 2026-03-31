import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

import { SOCKET_ON } from '@/constants/socket';
import useSocketListener from '@/hooks/useSocketListener';
import socket from '@/lib/socket';

import { SocialSignInStatus } from '../constant';

export const useSocialSignInEnabledSocket = (status: SocialSignInStatus) => {
  const router = useRouter();
  const isSender = useRef(false);

  const openLogInAgainModal = useCallback(() => {
    if (isSender) {
      return;
    }
    router.replace({ pathname: router.pathname, query: { ...router.query, social_sign_in_enabled: 'true' } });
  }, [isSender]);

  useEffect(() => {
    if (status !== SocialSignInStatus.SUCCESS) {
      return;
    }
    isSender.current = true;
    socket.emit(SOCKET_ON.User.EnableSocialSignInSuccess);
  }, [status]);

  useSocketListener(SOCKET_ON.User.EnableSocialSignInSuccess, openLogInAgainModal);
};
