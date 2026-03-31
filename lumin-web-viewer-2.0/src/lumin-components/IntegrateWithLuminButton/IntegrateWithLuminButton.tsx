/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';

import { useThemeMode, useTranslation } from 'hooks';
import { useIntegrate } from 'hooks/useIntegrate';

import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import * as Styled from './IntegrateWithLuminButton.styled';

type PropTypes = {
  currentUser: IUser;
  currentDocument: IDocumentBase;
  closeSignaturePopper: () => void;
};

export default function IntegrateWithLuminButton({
  currentUser,
  currentDocument,
  closeSignaturePopper,
}: PropTypes): JSX.Element {
  const themeMode: string = useThemeMode();
  const themeModeProvider = Styled.theme[themeMode];
  const { t } = useTranslation();
  const { onClickedIntegrate, handleEvent } = useIntegrate();

  const onClickIntegrate = (event: any): void => {
    closeSignaturePopper();
    handleEvent(INTEGRATE_BUTTON_NAME.REQUEST_SIGNATURES);
    onClickedIntegrate({
      currentUser,
      currentDocument,
    })(event);
  };

  useEffect(() => {
    handleEvent(INTEGRATE_BUTTON_NAME.VIEW_REQUEST_SIGNATURES);
  },[]);

  return (
    <ThemeProvider theme={themeModeProvider}>
        <Styled.Wrapper onClick={onClickIntegrate}>
          <Styled.Introduction>{t('viewer.bananaSign.signatureRequest')}</Styled.Introduction>
          <Styled.SignatureModalIntegration>
            <Icomoon className="icon-sign" size={32} />
            <Styled.ContentWrapper>
              <Styled.Title>{t('viewer.bananaSign.secureSigning')}</Styled.Title>
              <Styled.Description>{t('viewer.bananaSign.inviteOthersViaLuminSign')}</Styled.Description>
            </Styled.ContentWrapper>
          </Styled.SignatureModalIntegration>
        </Styled.Wrapper>
    </ThemeProvider>
  );
}