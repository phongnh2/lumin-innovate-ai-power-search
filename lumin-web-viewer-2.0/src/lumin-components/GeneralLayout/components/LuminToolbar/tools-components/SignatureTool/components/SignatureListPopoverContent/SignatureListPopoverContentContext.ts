import { createContext, useContext } from 'react';

export const SignatureListPopoverContentContext = createContext({
  closePopper: (f: unknown): unknown => f,
});

export const useSignatureListPopoverContentContext = () => useContext(SignatureListPopoverContentContext);
