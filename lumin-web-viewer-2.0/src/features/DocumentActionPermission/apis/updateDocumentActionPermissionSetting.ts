import { gql } from '@apollo/client';

import { client } from '@app-apollo';

import { IBasicResponse } from 'interfaces/common';

import { DocumentActionPermissionPrincipleType } from '../types/permissionRole.type';

export const updateDocumentActionPermissionSettings = async (
  input: {
    documentId: string;
    principles: DocumentActionPermissionPrincipleType[];
  },
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.mutate<{
    updateDocumentActionPermissionSettings: IBasicResponse;
  }>({
    mutation: gql`
      mutation updateDocumentActionPermissionSettings($input: UpdateDocumentActionPermissionSettingsInput!) {
        updateDocumentActionPermissionSettings(input: $input) {
          canEditDocumentActionPermission
          canExport
          canPrint
          canCopy
          canSaveAsTemplate
          canMerge
          canSendForSignatures
          canRequestSignatures
          canSaveACertifiedVersion
          principleList
        }
      }
    `,
    variables: {
      input,
    },
    context: {
      fetch: {
        signal,
      },
    },
  });
  return res.data?.updateDocumentActionPermissionSettings;
};
