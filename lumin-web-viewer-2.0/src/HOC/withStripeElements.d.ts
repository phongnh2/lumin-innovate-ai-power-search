export default withStripeElements;
declare function withStripeElements<T>(
  Component: React.ComponentType<T>,
  {
    action,
    skipRecaptcha,
    noTopGapLoading,
  }?: {
    action: string;
    skipRecaptcha?: boolean;
    noTopGapLoading?: boolean;
    onCloseRecaptchaErrorModal?: () => void;
  }
): (props: Omit<T, 'getNewSecret' | 'stripeAccountId'>) => JSX.Element;
