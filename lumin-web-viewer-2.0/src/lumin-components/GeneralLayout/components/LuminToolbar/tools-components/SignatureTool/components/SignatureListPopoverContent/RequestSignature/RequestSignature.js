/* eslint-disable import/no-named-as-default */
/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks';

import { useIsTempEditMode } from 'features/OpenForm';

import RequestSignatureBtn from './RequestSignatureBtn';
import { useRequestSignatureAvailbility } from '../../../hooks/useRequestSignatureAvailbility';

import * as Styled from './RequestSignature.styled';

const RequestSignature = ({ onlyAllowRequest }) => {
  const { t } = useTranslation();
  const { canRequest } = useRequestSignatureAvailbility();
  const { isTempEditMode } = useIsTempEditMode();

  if (!canRequest && !isTempEditMode) {
    return null;
  }

  return (
    <Styled.Wrapper data-no-gap={onlyAllowRequest}>
      <Styled.RequestSignatureTitle>{t('viewer.bananaSign.signatureRequest')}</Styled.RequestSignatureTitle>
      <RequestSignatureBtn />
    </Styled.Wrapper>
  );
};

RequestSignature.propTypes = {
  onlyAllowRequest: PropTypes.bool.isRequired,
};

export default RequestSignature;
