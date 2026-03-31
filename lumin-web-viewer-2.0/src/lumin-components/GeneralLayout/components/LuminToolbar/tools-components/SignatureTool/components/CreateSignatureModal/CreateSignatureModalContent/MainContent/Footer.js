import { Button } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { useTranslation } from 'hooks';

import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';

import * as Styled from './MainContent.styled';

export const Footer = () => {
  const { closeModal, createSignature, isDisabledButton } = useContext(CreateSignatureModalContentContext);

  const { t } = useTranslation();
  return (
    <Styled.FooterWrapper>
      <Button variant="outlined" size="lg" onClick={closeModal}>
        {t('common.cancel')}
      </Button>

      <Button variant="filled" size="lg" onClick={createSignature} disabled={isDisabledButton}>
        {t('common.save')}
      </Button>
    </Styled.FooterWrapper>
  );
};

export default Footer;
