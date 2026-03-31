import React from 'react';
import { useTranslation } from 'hooks';

import * as Styled from './GoogleButton.styled';

type Props = {
  onClick: (e: React.SyntheticEvent) => void;
  className: string;
  'data-lumin-btn-name': string;
};

const GoogleButton = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Styled.Button {...props}>
      <Styled.LogoWrapper>
        <Styled.Logo />
      </Styled.LogoWrapper>
      {t('authenPage.signIn.right.signInWithGoogle')}
    </Styled.Button>
  );
};

export default GoogleButton;
