import { GoogleReCaptchaProvider } from '@google-recaptcha/react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { Header } from '@/components/Header';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import { environment } from '@/configs/environment';
import { useGetQueryValuesFromReturnTo } from '@/hooks';

import EmailSent from './EmailSent';
import ForgotPassword from './ForgotPassword';
import useForgotPassword from './hooks/useForgotPassword';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

function ForgotPasswordPage() {
  const { isSendEmailSuccess, errorSendEmail, formState, register, resetField, handleSubmit, getValues } = useForgotPassword();
  const { returnToValue } = useGetQueryValuesFromReturnTo();

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as unknown as Record<string, unknown>).grecaptcha;
        delete (window as unknown as Record<string, unknown>).___grecaptcha_cfg;
      }
    };
  }, []);

  return (
    <div>
      <Header right={<HeaderSignInElement returnTo={returnToValue} />} />
      <GoogleReCaptchaProvider type='v2-checkbox' siteKey={environment.public.google.reCaptchaV2} isEnterprise>
        <AuthStyled.ForgotPasswordContainer>
          {isSendEmailSuccess ? (
            <EmailSent email={getValues('email')} />
          ) : (
            <ForgotPassword formState={formState} register={register} resetField={resetField} handleSubmit={handleSubmit} error={errorSendEmail} />
          )}
        </AuthStyled.ForgotPasswordContainer>
      </GoogleReCaptchaProvider>
    </div>
  );
}
export default ForgotPasswordPage;
