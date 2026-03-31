import { useMutation } from '@tanstack/react-query';

import { updateDocumentActionPermissionSettings } from '../apis/updateDocumentActionPermissionSetting';
import { DocumentActionPermissionPrincipleType } from '../types/permissionRole.type';

export const useUpdateDocumentActionPermissionSettings = () => {
  const { mutateAsync } = useMutation({
    mutationKey: ['updateDocumentActionPermissionSettings'],
    mutationFn: async (input: { documentId: string; principles: DocumentActionPermissionPrincipleType[] }) =>
      updateDocumentActionPermissionSettings(input),
  });

  return {
    updateDocumentActionPermissionSettings: mutateAsync,
  };
};
