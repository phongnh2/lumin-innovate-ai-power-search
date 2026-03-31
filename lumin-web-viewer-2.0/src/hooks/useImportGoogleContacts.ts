/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react';

import { googleServices, userServices } from 'services';

import logger from 'helpers/logger';

import { hotjarUtils, toastUtils } from 'utils';

import { DriveScopes, PeopleScopes } from 'constants/authConstant';
import { ErrorCode } from 'constants/errorCode';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { GetGoogleContactsContext } from 'constants/organizationConstants';

import { useTranslation } from './useTranslation';

function useImportGoogleContacts (orgId: string): {
  handleImportGoogleContacts: () => void;
  contacts: unknown[];
  isFetching: boolean;
} {
  const [isFetching, setIsFetching] = useState(false);
  const [contacts, setContacts] = useState<unknown[]>([]);
  const { t } = useTranslation();
  const getAccessToken = async (): Promise<{ authorizeEmail: string; accessToken: string; }> => {
    const isValidToken = await googleServices.isValidToken();
    const existedAccessToken = googleServices.getImplicitAccessToken();
    if (isValidToken &&
      googleServices.hasGrantedScope(PeopleScopes.GOOGLE_CONTACT) &&
      googleServices.hasGrantedScope(PeopleScopes.GOOGLE_DIRECTORY)) {
      return {
        authorizeEmail: existedAccessToken.email,
        accessToken: existedAccessToken?.access_token,
      };
    }
    let accessToken = '';
    let authorizeEmail = '';
    await googleServices.implicitSignIn({
      callback: (response: { scope: string, access_token: string, email: string }) => {
        accessToken = response.access_token;
        authorizeEmail = response.email;
      },
      onError: (error: any) => {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        const { type: grantPermissionError } = error;
        if (grantPermissionError === ErrorCode.Common.POPUP_FAILED_TO_OPEN) {
          toastUtils.openToastMulti({
            message: t('setUpOrg.blockedByBrowser'),
            type: ModalTypes.ERROR,
          });
          return;
        }
        toastUtils.openToastMulti({
          message: t('setUpOrg.accessDenied'),
          type: ModalTypes.ERROR,
        });
      },
      excludeScopes: [DriveScopes.DRIVE_FILE],
      scope: [PeopleScopes.GOOGLE_CONTACT, PeopleScopes.GOOGLE_DIRECTORY],
      loginHint: googleServices.getAccessTokenEmail(),
    }).catch((error) => {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
    });
    return {
      authorizeEmail,
      accessToken,
    };
  };
  const handleImportGoogleContacts = async () => {
    setIsFetching(true);
    try {
      const { accessToken, authorizeEmail } = await getAccessToken();
      if (!accessToken || !authorizeEmail) {
        return;
      }
      const googleContacts = await userServices.getGoogleContacts(accessToken, {
        action: GetGoogleContactsContext.INVITE_ORG_MEMBER,
        orgId,
        googleAuthorizationEmail: authorizeEmail,
      });
      hotjarUtils.trackEvent(HOTJAR_EVENT.CONNECT_GOOGLE_ACCOUNT);
      setContacts(googleContacts);
    } finally {
      setIsFetching(false);
    }
  };
  return ({
    handleImportGoogleContacts,
    contacts,
    isFetching,
  });
}

export default useImportGoogleContacts;