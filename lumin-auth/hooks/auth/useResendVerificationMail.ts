import { useEnsureVerificationFlowMutation, useResendVerificationLinkMutation } from '@/features/account/verification-api-slice';

const useResendVerificationMail = (getValues: (input: string) => string) => {
  const [ensureVerificationFlow, { data: verificationFlow, error: ensureError }] = useEnsureVerificationFlowMutation();
  const [resendVerificationLink, { isSuccess, error }] = useResendVerificationLinkMutation();
  const resendVerifyEmail = async () => {
    const flow = await ensureVerificationFlow({
      initial: verificationFlow
    }).unwrap();
    const email = getValues('email');
    if (email) {
      await resendVerificationLink({ flow, email });
    }
  };

  return { resendVerificationLink: resendVerifyEmail, isSuccess, serverError: ensureError || error };
};

export default useResendVerificationMail;
