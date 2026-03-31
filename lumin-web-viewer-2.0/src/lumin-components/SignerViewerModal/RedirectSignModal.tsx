/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';

import * as Styled from './SignerViewerModal.styled';

const RedirectSignModal = () => {
  const { t } = useTranslation();

  return (
    <Styled.IntegrationAlertModal>
      {/* @ts-ignore */}
      <Styled.Title forRedirect>{t('viewer.bananaSign.openingInBananasign')}</Styled.Title>
      <Styled.ContentWrapper>
        <SvgElement content="logo-lumin-small" width={80} height={80} />
        <Styled.SkeletonBar />
        <SvgElement content="sign-logo" width={80} height={80} />
      </Styled.ContentWrapper>
      <Styled.Description>{t('viewer.bananaSign.descOpeningInBananasign')}</Styled.Description>
    </Styled.IntegrationAlertModal>
  );
};

export default RedirectSignModal;
