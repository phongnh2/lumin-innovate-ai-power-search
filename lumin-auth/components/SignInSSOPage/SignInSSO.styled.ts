import styled from '@emotion/styled';

import ShieldIcon from '@/public/assets/shield.svg';
import { ButtonText, mediaQueryUp, Text } from '@/ui';

export const ShieldIconWrapper = styled(ShieldIcon)`
  margin: 0 auto;
  margin-bottom: 24px;
  display: block;
  height: 128px;
  width: auto;

  ${mediaQueryUp.md} {
    height: 144px;
  }
`;

export const SignInSSOContainer = styled.div`
  width: 100%;
`;

export const SignInSSOText = styled(Text)<{ marginBottom?: number }>(({ marginBottom = 24 }) => ({
  marginBottom
}));

export const SignInWithoutSSOButton = styled(ButtonText)`
  width: 100%;
  margin-top: 24px;
`;
