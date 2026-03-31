/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { Suspense } from 'react';
import { ThemeProvider } from 'styled-components';

import { useThemeMode, useTranslation } from 'hooks';

import { WIDGET_DIRECTIONS } from 'constants/notificationWidget';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './QRCodeDialog.styled';

type PropTypes = {
  isOpen: boolean;
  onClose: () => void;
};

const translationKey = 'widget.widgetType.DOWNLOAD_MOBILE_APP';

export default function QRCodeDialog({ isOpen, onClose }: PropTypes): JSX.Element {
  const themeMode: string = useThemeMode();
  const themeModeProvider = Styled.theme[themeMode];
  const { t } = useTranslation();
  if (!isOpen) {
    return null;
  }
  const getMedia = (fileName: string): string => `/assets/images/${fileName}`;

  const goToDownloadPage = (isAppStore = true): void => {
    if (isAppStore) {
      window.open(WIDGET_DIRECTIONS.DOWNLOAD_APP_VIA_APP_STORE, '_blank');
      return;
    }
    window.open(WIDGET_DIRECTIONS.DOWNLOAD_APP_VIA_PLAY_STORE, '_blank');
  };

  return (
    <ThemeProvider theme={themeModeProvider}>
      <Suspense fallback={<div />}>
        <Styled.CustomDialog width={ModalSize.SM} open={isOpen} hasCloseBtn onClose={onClose}>
          <Styled.Container>
            <Styled.Title>{t(`${translationKey}.title`)}</Styled.Title>
            <Styled.Description>{t(`${translationKey}.description`)}</Styled.Description>
            <Styled.QRContainer>
              <Styled.QRCode src={getMedia('QR_Code_download_app.svg')} alt="Lumin App" />
              <Styled.ImageWrapper>
                <Styled.Button onClick={() => goToDownloadPage()}>
                  <Styled.Image src={getMedia('apple_store.svg')} alt="Apple Store" />
                </Styled.Button>
                <Styled.Button onClick={() => goToDownloadPage(false)}>
                  <Styled.Image src={getMedia('goolgle_play.svg')} alt="Goolgle Play" />
                </Styled.Button>
              </Styled.ImageWrapper>
            </Styled.QRContainer>
          </Styled.Container>
        </Styled.CustomDialog>
      </Suspense>
    </ThemeProvider>
  );
}
