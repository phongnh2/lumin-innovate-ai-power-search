import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Sections } from '@/components/SettingsPage/constants/section';

import { SocialSignInProvider } from '../constant';

export const useHighLightProvider = (email: string) => {
  const router = useRouter();
  const { highlight, guestEmail } = router.query;
  const [hightlightProvider, setHighlightProvider] = useState<SocialSignInProvider | null>(null);

  useEffect(() => {
    if (!guestEmail || guestEmail === email) {
      switch (highlight) {
        case Sections.GOOGLE_SIGN_IN: {
          setHighlightProvider(SocialSignInProvider.GOOGLE);
          break;
        }
        case Sections.MICROSOFT_SIGN_IN: {
          setHighlightProvider(SocialSignInProvider.MICROSOFT);
          break;
        }
        default:
          break;
      }
    }
    // Only call router.replace if there are params to remove
    // This prevents unnecessary navigation that could trigger SSR redirect
    if (highlight || guestEmail) {
      const { pathname, query } = router;
      delete query.highlight;
      delete query.guestEmail;
      router.replace({
        pathname,
        query
      });
    }
  }, []);

  return { hightlightProvider, setHighlightProvider };
};
