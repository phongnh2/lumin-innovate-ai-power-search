import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import { GuestModeSignInProvider } from '@new-ui/components/DriveFilePreparationGuide/constant';

import { kratosService, ProfileSettingSections } from 'services/oryServices/kratos';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STORAGE_TYPE } from 'constants/lumin-common';
import { AUTH_SERVICE_URL, AXIOS_BASEURL, BASEURL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

export const useProfileButtonHandler = () => {
  const hintLoginService = useSearchParam(UrlSearchParam.HINT_LOGIN_SERVICE);
  const hintLoginServiceRef = useRef(hintLoginService);
  const [searchParams, setSearchParams] = useSearchParams();
  const { documentId } = useParams();
  const storage = searchParams.get(UrlSearchParam.STORAGE);

  const handleSignIn = (email: string) => {
    const baseUrl = process.env.NODE_ENV === 'development' ? AXIOS_BASEURL : BASEURL;
    let returnTo;
    if (storage === STORAGE_TYPE.ONEDRIVE) {
      const state = searchParams.get(UrlSearchParam.STATE);
      const authParams = new URLSearchParams({
        highlight: ProfileSettingSections.MICROSOFT_SIGN_IN,
        return_to: `${baseUrl}/open/onedrive/redirect?state=${state}`,
      });
      returnTo = new URL(
        decodeURIComponent(AUTH_SERVICE_URL + getFullPathWithPresetLang(`/profile-settings?${authParams.toString()}`))
      );
    } else {
      const state = { action: 'open', ids: [documentId], skipDriveInstall: true };
      const urlOpenGoogle = `return_to=${baseUrl}/open/google?state=${JSON.stringify(state)}`;
      returnTo = new URL(
        decodeURIComponent(
          AUTH_SERVICE_URL +
            getFullPathWithPresetLang(
              `/profile-settings?highlight=${ProfileSettingSections.GOOGLE_SIGN_IN}&${urlOpenGoogle}`
            )
        )
      );
    }
    kratosService.signIn({ url: returnTo.toString() }, {}, { loginHint: email });
  };

  useEffect(() => {
    if (searchParams.has(UrlSearchParam.HINT_LOGIN_SERVICE)) {
      searchParams.delete(UrlSearchParam.HINT_LOGIN_SERVICE);
      setSearchParams(searchParams);
    }
  }, []);

  return {
    hintLoginService: hintLoginServiceRef.current,
    handleSignIn,
    storage,
    provider: storage === STORAGE_TYPE.ONEDRIVE ? GuestModeSignInProvider.Microsoft : GuestModeSignInProvider.Google,
  };
};
