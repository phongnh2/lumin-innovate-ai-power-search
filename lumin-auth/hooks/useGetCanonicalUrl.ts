import { useRouter } from 'next/router';

import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';

const useGetCanonicalUrl = () => {
  const router = useRouter();

  return [Routes.SignIn, Routes.SignUp, Routes.SignUpInvitation, Routes.ResendVerification].includes(router.pathname as Routes)
    ? environment.public.host.authUrl + router.pathname
    : '';
};

export default useGetCanonicalUrl;
