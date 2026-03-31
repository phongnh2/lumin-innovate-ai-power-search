import { useAppSelector } from '@/lib/hooks';
import { isGSILoaded } from '@/selectors';
import { loginPopup as googleLoginPopup } from '@/services/google.service';
import { loginPopup as xeroLoginPopup } from '@/services/xero.service';

import { SocialSignInProvider } from '../constant';
import { microsoftClient } from '../MicrosoftClient';

export const usePromptSelectSocialAccount = ({ hintEmail, provider }: { hintEmail: string; provider: SocialSignInProvider | null }) => {
  const isGsiLoaded = useAppSelector(isGSILoaded);

  const promptSelectSocialAccount = async () => {
    switch (provider) {
      case SocialSignInProvider.GOOGLE:
        if (!isGsiLoaded || !window.google) {
          // Bypass if GSI is not loaded
          return hintEmail;
        }
        return new Promise<string>(resolve => {
          googleLoginPopup({ callback: email => resolve(email), loginHint: hintEmail });
        });
      case SocialSignInProvider.MICROSOFT:
        await microsoftClient.loginRedirect(hintEmail);
        break;
      case SocialSignInProvider.XERO:
        return new Promise<string>(resolve => {
          xeroLoginPopup({ callback: email => resolve(email) });
        });
      default:
        break;
    }
    return '';
  };

  return { promptSelectSocialAccount };
};
