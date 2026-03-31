import { useRouter } from 'next/router';

import { QUERY_KEYS } from '@/constants/common';

import { SocialSignInProvider } from '../constant';

export const useSocialSignInQuery = () => {
  const router = useRouter();
  const { query } = router;

  return {
    query: {
      requestEnableSocialSignIn: query[QUERY_KEYS.REQUEST_SOCIAL_SIGN_IN],
      provider: query[QUERY_KEYS.PROVIDER] as SocialSignInProvider
    }
  };
};
