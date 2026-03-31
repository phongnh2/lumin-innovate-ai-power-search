import { useRouter } from 'next/router';
import { useEffect } from 'react';

import LoadingLogo from '@/components/LoadingLogo/LoadingLogo';
import { environment } from '@/configs/environment';
import { QUERY_KEYS } from '@/constants/common';
import { useUseGetCannyRedirectUrlQuery } from '@/features/account/account-api-slice';

function Canny() {
  const router = useRouter();
  const redirectTo = router.query[QUERY_KEYS.REDIRECT] as string;
  const { data, isLoading } = useUseGetCannyRedirectUrlQuery({ redirectTo });

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!data?.url) {
      router.push(environment.public.host.cannyUrl);
      return;
    }
    router.push(data.url);
  }, [data, isLoading]);

  return <LoadingLogo whiteBackground />;
}
export default Canny;
