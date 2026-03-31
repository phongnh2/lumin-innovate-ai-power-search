import { useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { useTranslation } from 'hooks';

import { googleServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { PeopleScopes } from 'constants/authConstant';
import { ErrorCode } from 'constants/errorCode';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { CONTACT_LIST_CONNECT } from 'constants/organizationConstants';

const ADD_COLLABORATORS = 'ADD_COLLABORATORS';

const useHandleConnectGoogle = ({ setStep, setType }) => {
  const [accessToken, setAccessToken] = useState('');
  const [googleMail, setGoogleMail] = useState('');
  const { t } = useTranslation();

  const handleConnect = async () => {
    const isValidToken = await googleServices.isValidToken();
    const existedAccessToken = googleServices.getImplicitAccessToken();
    if (
      isValidToken &&
      googleServices.hasGrantedScope(PeopleScopes.GOOGLE_CONTACT) &&
      googleServices.hasGrantedScope(PeopleScopes.GOOGLE_DIRECTORY)
    ) {
      const currentUserEmail = await googleServices.getCurrentRemoteEmail();
      unstable_batchedUpdates(() => {
        setAccessToken(existedAccessToken.access_token);
        setStep(ADD_COLLABORATORS);
        setType(CONTACT_LIST_CONNECT.CONNECT);
        setGoogleMail(currentUserEmail);
      });
    } else {
      googleServices.implicitSignIn({
        callback: async (tokenResponse) => {
          const { scope } = tokenResponse;
          if (!(scope.includes(PeopleScopes.GOOGLE_CONTACT) && scope.includes(PeopleScopes.GOOGLE_DIRECTORY))) {
            handleConnect();
            return;
          }
          const email = await googleServices.getCurrentRemoteEmail();
          unstable_batchedUpdates(() => {
            setAccessToken(tokenResponse.access_token);
            setStep(ADD_COLLABORATORS);
            setType(CONTACT_LIST_CONNECT.CONNECT);
            setGoogleMail(email);
          });
        },
        onError: (error) => {
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
          } else {
            toastUtils.openToastMulti({
              message: t('setUpOrg.accessDenied'),
              type: ModalTypes.ERROR,
            });
          }
        },
        scope: [PeopleScopes.GOOGLE_CONTACT, PeopleScopes.GOOGLE_DIRECTORY],
        excludeScopes: [PeopleScopes.DRIVE_FILE],
        loginHint: googleServices.getAccessTokenEmail(),
      });
    }
  };

  return { accessToken, googleMail, handleConnect };
};

export { useHandleConnectGoogle };
