import { useContext } from 'react';

import { LuminCommentBoxContext } from '../context';

export const useLuminCommentBoxContext = () => {
  const contextValues = useContext(LuminCommentBoxContext);
  if (!contextValues) {
    throw new Error('useLuminCommentBoxContext must be used within a LuminCommentBox Provider');
  }
  return contextValues;
};
