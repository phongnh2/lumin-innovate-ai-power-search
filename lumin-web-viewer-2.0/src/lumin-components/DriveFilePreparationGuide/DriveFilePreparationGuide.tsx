/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { MutableRefObject, useState } from 'react';
import { Trans } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import { GuestModeSignInProvider } from '@new-ui/components/DriveFilePreparationGuide/constant';

import GoogleIllustrationDark from 'assets/images/drive-file-preparation-google-dark.png';
import GoogleIllustrationLight from 'assets/images/drive-file-preparation-google-light.png';
import MicrosoftIllustrationDark from 'assets/images/drive-file-preparation-microsoft-dark.png';
import MicrosoftllustrationLight from 'assets/images/drive-file-preparation-microsoft-light.png';

import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper';

import { useThemeMode, useTranslation } from 'hooks';

import { LOGIN_SERVICE_TO_WORDING } from 'constants/authConstant';

import * as Styled from './DriveFilePreparationGuide.styled';

export default function DriveFilePreparationGuide({
  buttonSignInRef,
  email = '',
  hintLoginService,
  isLoadingDocument,
  provider,
}: {
  buttonSignInRef: MutableRefObject<any>;
  email: string;
  hintLoginService: string;
  isLoadingDocument: boolean;
  provider: string;
}): JSX.Element {
  const [open, setOpen] = useState(Boolean(email));
  const themeMode = useThemeMode();
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
  };
  const getIllustrationSrc = () => {
    switch (provider) {
      case GuestModeSignInProvider.Google:
        return themeMode === 'light' ? GoogleIllustrationLight : GoogleIllustrationDark;
      case GuestModeSignInProvider.Microsoft:
        return themeMode === 'light' ? MicrosoftllustrationLight : MicrosoftIllustrationDark;
      default:
        return '';
    }
  };

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <MaterialPopper
        open={!isLoadingDocument && buttonSignInRef.current && open}
        classes={`theme-${themeMode}`}
        anchorEl={buttonSignInRef.current}
        handleClose={handleClose}
        placement="bottom"
        parentOverflow="viewport"
        disablePortal={false}
        preventOverflow
        showArrow
        noPadding
        arrowClasses={themeMode}
        disableClickAway
      >
        <Styled.PopperContainer>
          <Styled.PopperImg src={getIllustrationSrc()} alt="illustration" />
          <div>
            <Styled.Title>{t('driveFilePreparationGuide.title', { provider })}</Styled.Title>
            <Styled.Description>
              <Trans
                i18nKey="driveFilePreparationGuide.description"
                values={{ email, loginService: LOGIN_SERVICE_TO_WORDING[hintLoginService], provider }}
                components={{ b: <b style={{ fontWeight: '600' }} /> }}
              />
            </Styled.Description>
          </div>
          <Styled.CloseButton onClick={handleClose}>
            <Icomoon className="cancel" size="14" />
          </Styled.CloseButton>
        </Styled.PopperContainer>
      </MaterialPopper>
    </ThemeProvider>
  );
}
