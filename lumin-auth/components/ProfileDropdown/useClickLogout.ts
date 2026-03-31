import { useRouter } from 'next/router';

import { Routes } from '@/configs/routers';
import { QUERY_KEYS } from '@/constants/common';
import { useLogoutMutation } from '@/features/account/account-api-slice';
import { updateModalProperties } from '@/features/modal-slice';
import { useAppDispatch } from '@/lib/hooks';
import { frontendApi } from '@/lib/ory';
import sessionManagement from '@/lib/session';
import socket from '@/lib/socket';
import { emitToNativeWebView } from '@/utils/account.utils';
import { isGoogleOpenPath } from '@/utils/openGoogle.utils';

function useClickLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { query } = router;
  const isGoogleOpen = isGoogleOpenPath(router.query[QUERY_KEYS.RETURN_TO] as string);
  const [logout] = useLogoutMutation();
  const clickLogout = async (returnTo?: string) => {
    dispatch(updateModalProperties({ isProcessing: true }));
    await sessionManagement.getAuthorizeToken({ forceNew: true });
    const { data: flow } = await frontendApi.createLogoutFlow();
    const { logout_token: token } = flow;
    await frontendApi.updateLogoutFlow({ logoutToken: token });
    await logout({});
    // Restart the connection instead of closing it
    socket.startConnection();
    localStorage.removeItem('token');
    emitToNativeWebView('logoutSuccess');
    let queryParams = returnTo || query;
    if (isGoogleOpen) {
      queryParams = '';
    }
    router.push({
      pathname: Routes.SignIn,
      query: queryParams
    });
    dispatch(updateModalProperties({ isProcessing: false }));
  };
  return [clickLogout];
}

export default useClickLogout;
