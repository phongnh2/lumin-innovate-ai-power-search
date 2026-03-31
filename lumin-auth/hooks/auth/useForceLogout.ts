import { useRouter } from 'next/router';

import { useForceLogoutMutation } from '@/features/account/account-api-slice';
import { updateModalProperties } from '@/features/modal-slice';
import { ForceLogoutType } from '@/interfaces/user';
import { useAppDispatch } from '@/lib/hooks';
import { frontendApi } from '@/lib/ory';
import sessionManagement from '@/lib/session';
import socket from '@/lib/socket';

function useForceLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout] = useForceLogoutMutation();
  const forceLogout = async (type = ForceLogoutType.DEFAULT, returnTo = '') => {
    dispatch(updateModalProperties({ isProcessing: true }));
    const sessionAvailable = await sessionManagement.getAuthorizeToken({ forceNew: true });
    const returnToParam = returnTo ? `?return_to=${returnTo}` : '';
    if (!sessionAvailable) {
      localStorage.removeItem('token');
      router.push(`/sign-in${returnToParam}`);
      return;
    }
    const { data: flow } = await frontendApi.createLogoutFlow();
    const { logout_token: token } = flow;
    await frontendApi.updateLogoutFlow({ logoutToken: token });
    // Restart the connection instead of closing it
    socket.startConnection();
    await logout({ type });
    localStorage.removeItem('token');
    router.push(`/sign-in${returnToParam}`);
  };
  return [forceLogout];
}

export default useForceLogout;
