import { useAddSignature } from './useAddSignature';
import { useDeleteSignature } from './useDeleteSignature';
import { useReorderSignature } from './useReorderSignature';

export const useSignaturesAction = () => {
  const deleteSignatureResult = useDeleteSignature();
  const addSignatureResult = useAddSignature();
  const reorderSignatureResult = useReorderSignature();

  return {
    ...deleteSignatureResult,
    ...addSignatureResult,
    ...reorderSignatureResult,
  };
};
