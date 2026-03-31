import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { SOCKET_EMIT } from '@/constants/socket';
import { useEnsureLoginFlowMutation, useLoginSamlSsoMutation, useVerifySsoEmailMutation } from '@/features/account/sign-in-api-slice';
import { THookFormSubmitHandler } from '@/interfaces/common';
import { useForm } from '@/lib/react-hook-form';
import socket from '@/lib/socket';
import { TSignInSSOSchema, signInSSOSchema } from '@/lib/yup';
import { handleReturnTo } from '@/utils/auth.utils';

type TPayload = {
  loginSuccess: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginError: any;
  formState: UseFormReturn<TSignInSSOSchema>['formState'];
  register: UseFormReturn<TSignInSSOSchema>['register'];
  getValues: UseFormReturn<TSignInSSOSchema>['getValues'];
  resetField: UseFormReturn<TSignInSSOSchema>['resetField'];
  handleSubmit: THookFormSubmitHandler;
};

const useSignInSSO = (): TPayload => {
  const router = useRouter();
  const { return_to: returnToQuery, loginHint } = router.query;

  const [ensureLoginFlow] = useEnsureLoginFlowMutation();
  const [verifySsoEmail, { error: verifySsoEmailError }] = useVerifySsoEmailMutation();
  const [loginSamlSso, { isSuccess: isLoginSamlSsoSuccess, error: loginSamlSsoError }] = useLoginSamlSsoMutation();

  const returnTo = returnToQuery && String(returnToQuery);

  const { handleSubmit, resetField, formState, register, getValues, setValue } = useForm<TSignInSSOSchema>({
    schema: signInSSOSchema
  });

  // handle loginHint query parameter
  useEffect(() => {
    if (loginHint && typeof loginHint === 'string') {
      // set the email field value from loginHint
      setValue('email', loginHint);

      // remove loginHint from URL without affecting other query params
      const { loginHint: _, ...queryWithoutLoginHint } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: queryWithoutLoginHint
        },
        undefined,
        { shallow: true }
      );
    }
  }, [loginHint, setValue, router]);

  const submitSignInSSO = handleSubmit(async form => {
    const { email } = form;
    const { providerId, organizationId } = await verifySsoEmail({ email }).unwrap();

    const newFlow = await ensureLoginFlow({
      returnTo: handleReturnTo({ router, getReturnTo: () => returnTo, email: email }),
      refresh: true,
      organization: organizationId
    }).unwrap();
    await loginSamlSso({ flow: newFlow, provider: providerId });
    socket.emit(SOCKET_EMIT.User.SignIn);
  });

  return {
    loginSuccess: isLoginSamlSsoSuccess,
    loginError: verifySsoEmailError || loginSamlSsoError,
    formState,
    register,
    getValues,
    resetField,
    handleSubmit: submitSignInSSO
  };
};

export default useSignInSSO;
