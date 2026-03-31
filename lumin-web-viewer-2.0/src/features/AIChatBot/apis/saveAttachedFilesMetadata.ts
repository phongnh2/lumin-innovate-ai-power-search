import { gql } from '@apollo/client';

import { client } from '@app-apollo';

import { IBasicResponse } from 'interfaces/common';

export const saveAttachedFilesMetadata = async (
  input: {
    chatSessionId: string;
    s3RemoteId: string;
    etag: string;
    totalPages: number;
  },
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.mutate<{
    saveAttachedFilesMetadata: IBasicResponse;
  }>({
    mutation: gql`
      mutation saveAttachedFilesMetadata($input: SaveAttachedFilesMetadataInput!) {
        saveAttachedFilesMetadata(input: $input) {
          message
          statusCode
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
  return res.data?.saveAttachedFilesMetadata;
};
