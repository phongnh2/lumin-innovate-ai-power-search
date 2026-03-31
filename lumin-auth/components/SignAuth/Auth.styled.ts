import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Button, mediaQueryUp } from '@/ui';

export const FormFields = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
`;

export const AcceptTermsWrapper = styled.div`
  margin-top: 24px;
`;

export const ForgotPasswordContainer = styled.div`
  width: 100%;
`;

export const VerifyEmailContainer = styled(ForgotPasswordContainer)``;

export const VerificationEmailSentContainer = styled.div`
  width: 626px;
  margin: 0 auto;
`;

export const SubmitButton = styled(Button)`
  margin-top: 36px;
  margin-bottom: 24px;
  ${mediaQueryUp.md} {
    margin-top: 40px;
  }
`;

export const ForgotPassword = styled.div`
  margin-top: 16px;
`;

export const forgotPwdDescCss = css`
  margin-bottom: 32px;
`;
