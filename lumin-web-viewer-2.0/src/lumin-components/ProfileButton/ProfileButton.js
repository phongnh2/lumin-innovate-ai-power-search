import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';

import { useProfileButtonHandler } from '@new-ui/components/LuminTitleBar/components/TitleBarRightSection/components/LuminProfileButton/hooks/useProfileButtonHandler';
import { ProfileDropdown } from '@web-new-ui/components/ProfileDropdown';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import DriveFilePreparationGuide from 'luminComponents/DriveFilePreparationGuide';

import { useTranslation } from 'hooks';

import { googleServices, oneDriveServices } from 'services';
import { kratosService } from 'services/oryServices';

import { STORAGE_TYPE } from 'constants/lumin-common';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import './ProfileButton.scss';

const propTypes = {
  currentUser: PropTypes.object,
  isLoadingDocument: PropTypes.bool,
};

const defaultProps = {
  currentUser: {},
  isLoadingDocument: false,
};

const ProfileButton = (props) => {
  const { t } = useTranslation();
  const { currentUser, isLoadingDocument } = props;
  const isGuestPath = Boolean(useMatch({ path: '/viewer/guest/:documentId', end: false }));

  const buttonSignInRef = useRef(null);
  const { hintLoginService, handleSignIn, provider } = useProfileButtonHandler();
  const [searchParams] = useSearchParams();

  if (!currentUser) {
    if (isGuestPath) {
      const storage = searchParams.get(UrlSearchParam.STORAGE);
      const email =
        storage === STORAGE_TYPE.ONEDRIVE
          ? oneDriveServices.getCurrentAccountEmailInCache()
          : googleServices.getImplicitAccessToken()?.email;
      return (
        <div className="ProfileButton" ref={buttonSignInRef}>
          <ButtonMaterial size={ButtonSize.XS} onClick={() => handleSignIn(email)}>
            {t('common.signIn')}
          </ButtonMaterial>
          <DriveFilePreparationGuide
            buttonSignInRef={buttonSignInRef}
            email={email}
            hintLoginService={hintLoginService}
            isLoadingDocument={isLoadingDocument}
            provider={provider}
          />
        </div>
      );
    }
    return (
      <div className="ProfileButton">
        <ButtonMaterial
          onClick={() => kratosService.signIn(true)}
          color={ButtonColor.SECONDARY_RED}
          style={{ marginRight: 12 }}
          size={ButtonSize.XS}
        >
          {t('common.signIn')}
        </ButtonMaterial>
        <ButtonMaterial onClick={() => kratosService.signUp(true)} size={ButtonSize.XS}>
          {t('common.signUpFree')}
        </ButtonMaterial>
      </div>
    );
  }

  return <ProfileDropdown />;
};

ProfileButton.propTypes = propTypes;
ProfileButton.defaultProps = defaultProps;

export default ProfileButton;
