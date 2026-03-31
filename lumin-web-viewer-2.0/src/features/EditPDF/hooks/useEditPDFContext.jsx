import { useContext } from 'react';

import { EditPDFContext } from '../contexts';

export const useEditPDFContext = () => {
  const contextValues = useContext(EditPDFContext);
  if (!contextValues) {
    throw new Error('useEditPDFContext must be used within a EditPDFProvider');
  }
  return contextValues;
};
