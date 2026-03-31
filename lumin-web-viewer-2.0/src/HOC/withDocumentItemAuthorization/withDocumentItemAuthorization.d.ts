import { ComponentType } from 'react';

type DocumentItemAuthorizationProps = {
  withAuthorize: (action: string) => boolean;
};

declare function withDocumentItemAuthorization<P>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof DocumentItemAuthorizationProps>>;

export default withDocumentItemAuthorization;
