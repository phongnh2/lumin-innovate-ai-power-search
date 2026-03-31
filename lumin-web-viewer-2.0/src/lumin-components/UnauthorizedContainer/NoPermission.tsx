import React from 'react';

import UnauthorizeImage from 'assets/images/cannot-open-document.svg';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';

import * as Styled from './UnauthorizedContainer.styled';

interface IProps {
  title: string;
  message: string;
  onBack: () => unknown;
  backButtonLabel: string;
  disabledLayout: boolean;
}

const NoPermission = ({
  title = `You don't have permission`,
  message,
  onBack,
  backButtonLabel,
  disabledLayout = false,
}: IProps): JSX.Element => {
  const mainUI = (
    <Styled.UnAuthorizationContainer>
      <Styled.UnAuthorizationImage src={UnauthorizeImage as string} alt="AuthorizeContainerImage" />
      <Styled.Title>{title}</Styled.Title>
      <Styled.Message>{message}</Styled.Message>
      <Styled.ButtonUnAuthorization size={ButtonSize.XL} onClick={onBack}>
        {backButtonLabel}
      </Styled.ButtonUnAuthorization>
    </Styled.UnAuthorizationContainer>
  );

  if (disabledLayout) {
    return mainUI;
  }
  return (
    <LayoutSecondary footer={false} staticPage>
      {mainUI}
    </LayoutSecondary>
  );
};

export default NoPermission;
