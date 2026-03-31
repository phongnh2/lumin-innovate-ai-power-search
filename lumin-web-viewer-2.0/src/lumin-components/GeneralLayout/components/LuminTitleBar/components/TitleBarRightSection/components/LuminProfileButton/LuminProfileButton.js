import { Button } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import DriveFilePreparationGuide from '@new-ui/components/DriveFilePreparationGuide';
import { ProfileDropdown } from '@web-new-ui/components/ProfileDropdown';

import { useTranslation } from 'hooks';
import useRefetchOrganizationSignSeats from 'hooks/useRefetchOrganizationSignSeats';
import { useViewerMode } from 'hooks/useViewerMode';

import { oneDriveServices } from 'services';
import googleServices from 'services/googleServices';
import { kratosService } from 'services/oryServices';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { useProfileButtonHandler } from './hooks/useProfileButtonHandler';

import * as Styled from './LuminProfileButton.styled';

const LuminProfileButton = () => {
  const { t } = useTranslation();
  const { isDriveGuestMode, isAnonymousMode } = useViewerMode();
  const buttonSignInRef = useRef(null);
  const { hintLoginService, handleSignIn, storage, provider } = useProfileButtonHandler();

  useRefetchOrganizationSignSeats({});

  if (isAnonymousMode) {
    if (isDriveGuestMode) {
      const email =
        storage === STORAGE_TYPE.ONEDRIVE
          ? oneDriveServices.getCurrentAccountEmailInCache()
          : googleServices.getImplicitAccessToken()?.email;

      return (
        <>
          <Button variant="filled" size="lg" onClick={() => handleSignIn(email)} ref={buttonSignInRef}>
            {t('common.signIn')}
          </Button>
          <DriveFilePreparationGuide
            anchorEl={buttonSignInRef}
            email={email}
            hintLoginService={hintLoginService}
            provider={provider}
          />
        </>
      );
    }

    return (
      <Styled.ProfileButton>
        <Button variant="outlined" size="lg" onClick={() => kratosService.signIn(true)} ref={buttonSignInRef}>
          {t('common.signIn')}
        </Button>
        <Button variant="filled" size="lg" onClick={() => kratosService.signUp(true)}>
          {t('common.signUpFree')}
        </Button>
      </Styled.ProfileButton>
    );
  }

  return <ProfileDropdown />;
};

export default LuminProfileButton;
