import { gql } from '@apollo/client';

import { client } from '@app-apollo';

export interface CheckAttachedFilesMetadataPayload {
  etag: string;
  isExist: boolean;
}

export const checkAttachedFilesMetadata = async (
  input: { chatSessionId: string; etag: string },
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.query<{
    checkAttachedFilesMetadata: CheckAttachedFilesMetadataPayload;
  }>({
    query: gql`
      query checkAttachedFilesMetadata($input: CheckAttachedFilesMetadataInput!) {
        checkAttachedFilesMetadata(input: $input) {
          etag
          isExist
        }
      }
    `,
    variables: {
      input,
    },
    fetchPolicy: 'no-cache',
    context: {
      fetch: {
        signal,
      },
    },
  });
  return res.data.checkAttachedFilesMetadata;
};
