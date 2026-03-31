/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecoveryFlow } from '@ory/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { useEnsureRecoveryFlowMutation, useGetRecoveryFlowQuery, useRecoverPasswordMutation } from '@/features/account/account-api-slice';
import { THookFormSubmitHandler } from '@/interfaces/common';
import { ReCaptchaAction } from '@/interfaces/user';
import { clientLogger } from '@/lib/logger';
import { ValidationError } from '@/lib/ory';
import { useForm } from '@/lib/react-hook-form';
import { TForgotPasswordSchema, forgotPasswordSchema } from '@/lib/yup';

type TPayload = {
  isSendEmailSuccess: boolean;
  errorSendEmail: any;
  formState: UseFormReturn<TForgotPasswordSchema>['formState'];
  register: UseFormReturn<TForgotPasswordSchema>['register'];
  getValues: UseFormReturn<TForgotPasswordSchema>['getValues'];
  resetField: UseFormReturn<TForgotPasswordSchema>['resetField'];
  handleSubmit: THookFormSubmitHandler;
};

const useForgotPassword = (): TPayload => {
  const router = useRouter();
  const { return_to: returnToQuery, flow: existingFlowId } = router.query;

  const [ensureFlow, { data: flow }] = useEnsureRecoveryFlowMutation();
  const [recoverPassword, { isSuccess, error }] = useRecoverPasswordMutation();
  // Flow from recovery email
  const { data: existingFlow } = useGetRecoveryFlowQuery(existingFlowId as string, { skip: !existingFlowId });

  const returnTo = returnToQuery && String(returnToQuery);

  const { handleSubmit, resetField, formState, register, getValues } = useForm<TForgotPasswordSchema>({
    schema: forgotPasswordSchema
  });

  useEffect(() => {
    ensureFlow({ returnTo });
  }, [ensureFlow, returnTo]);

  useEffect(() => {
    if (!existingFlow) {
      return;
    }
    const existingFlowErr = ValidationError.fromSelfServiceFlow(existingFlow);
    const { expires_at, issued_at, state } = existingFlowErr.flow() as RecoveryFlow;
    clientLogger.error({
      reason: 'Recovery failed',
      message: existingFlowErr.messages()[0].message,
      attributes: { expires_at, issued_at, state }
    });
  }, [existingFlow]);

  const submitForgotPassword = handleSubmit(async form => {
    const { email, token } = form;
    const newFlow = await ensureFlow({ initial: flow, returnTo }).unwrap();
    await recoverPassword({ flow: newFlow, email, token, action: ReCaptchaAction.FORGOT_PASSWORD });
  });

  return {
    isSendEmailSuccess: isSuccess,
    errorSendEmail: error,
    formState,
    register,
    getValues,
    resetField,
    handleSubmit: submitForgotPassword
  };
};

export default useForgotPassword;
