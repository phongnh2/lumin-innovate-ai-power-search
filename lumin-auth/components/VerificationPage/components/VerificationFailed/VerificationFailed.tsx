import { css } from '@emotion/react';
import { isEmpty } from 'lodash';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import { useEffect } from 'react';

import Form from '@/components/Form';
import { Header } from '@/components/Header';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import { Routes } from '@/configs/routers';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { setVerificationEmail } from '@/features/account/account-slice';
import { getServerError, isSerializedError } from '@/features/errors';
import useResendVerificationMail from '@/hooks/auth/useResendVerificationMail';
import useTranslation from '@/hooks/useTranslation';
import { LoginService } from '@/interfaces/user';
import { useAppDispatch } from '@/lib/hooks';
import { useForm } from '@/lib/react-hook-form';
import { emailSchema, TEmailSchema } from '@/lib/yup';
import letterOpenError from '@/public/assets/letter-open-error.svg?url';
import { Text, Alert, Input, Button } from '@/ui';
import { ButtonSize } from '@/ui/Button';
import { getAuthenticationMethodMessage, getAuthenticationMethodText } from '@/utils/auth.utils';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import { verifyContainerCss, buttonCss, verificationFailTitleCss, verificationMessageHasErrorCss, verificationMessageCss } from '../../VerificationPage.styled';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

export default function VerificationFailed(): JSX.Element {
  const { t } = useTranslation();
  const { register, handleSubmit, formState, getValues } = useForm<TEmailSchema>({
    schema: emailSchema
  });
  const { errors, isSubmitting, isSubmitted } = formState;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { resendVerificationLink, isSuccess, serverError } = useResendVerificationMail(getValues);

  useEffect(() => {
    if (isSuccess) {
      dispatch(setVerificationEmail(getValues('email')));
      router.push(Routes.ResendVerification);
    }
  }, [isSuccess]);
  const onSubmit = handleSubmit(async () => {
    await resendVerificationLink();
  });

  const getServerErrorMessage = () => {
    if (!serverError) {
      return null;
    }
    if (!isSerializedError<{ loginService?: LoginService }>(serverError)) {
      return CommonErrorMessage.Common.SOMETHING_WENT_WRONG;
    }
    const errorMapping = {
      [ErrorCode.User.ALREADY_VERIFIED]: (
        <Trans
          i18nKey='verifyAccount.alreadyVerified'
          components={{ b: <Text as={Link} href={Routes.SignIn} underline variant='highlight' bold level={6} /> }}
        />
      ),
      ...getServerError(serverError, t),
      [ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD]: getAuthenticationMethodMessage(
        getAuthenticationMethodText((serverError.data.meta?.loginService as LoginService) || 'unknown_third_party', t),
        true
      )
    };
    return errorMapping[serverError.data.code] || serverError.data.message;
  };

  return (
    <div>
      <Header right={<HeaderSignInElement />} />

      <AuthStyled.VerifyEmailContainer css={verifyContainerCss}>
        <Image
          src={letterOpenError}
          alt='icon'
          style={{
            width: '100%',
            marginBottom: '16px'
          }}
        />
        <Text as='h1' bold level={{ mobile: 3, tablet: 1 }} align='center' css={verificationFailTitleCss}>
          {t('verifyAccount.verificationFailed')}
        </Text>
        <Text variant='neutral' align='center' css={Boolean(getServerErrorMessage()) ? verificationMessageHasErrorCss : verificationMessageCss}>
          {t('verifyAccount.verificationInvalid')}
        </Text>
        <Alert
          show={Boolean(getServerErrorMessage())}
          css={css`
            margin-bottom: 16px;
          `}
        >
          {getServerErrorMessage()}
        </Alert>
        <Form onSubmit={onSubmit} style={{ width: '100%' }} noValidate>
          <Input
            {...register('email')}
            type='email'
            icon='email'
            placeholder={t('placeholder.yourEmail')}
            autoComplete='email'
            error={getErrorMessageTranslated(errors.email?.message, t)}
          />
          <Button
            css={buttonCss}
            size={ButtonSize.XL}
            type='submit'
            loading={isSubmitting || (isSubmitted && isEmpty(errors) && isEmpty(serverError) && !isSuccess)}
          >
            {t('authPage.didNotReceiveAnEmail')}
          </Button>
        </Form>
      </AuthStyled.VerifyEmailContainer>
    </div>
  );
}
