/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable arrow-body-style */
import React from 'react';

import Header from './Header';
import MainContent from './MainContent';

import * as Styled from './CreateSignatureModalContent.styled';

const CreateSignatureModalContent = () => {
  return (
    <Styled.ModalContentWrapper data-cy="create_signature_modal_wrapper">
      <Header />
      <MainContent />
    </Styled.ModalContentWrapper>
  );
};

export default CreateSignatureModalContent;
