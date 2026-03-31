import { gql } from '@apollo/client';

import { client } from '@app-apollo';

export interface GetPresignedUrlForAttachedFilesPayload {
  presignedUrl: string;
}

export const getPresignedUrlForAttachedFiles = async (
  input: { documentId: string; attachedFileId: string },
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.query<{
    getPresignedUrlForAttachedFiles: GetPresignedUrlForAttachedFilesPayload;
  }>({
    query: gql`
      query getPresignedUrlForAttachedFiles($input: GetPresignedUrlForAttachedFilesInput!) {
        getPresignedUrlForAttachedFiles(input: $input) {
          presignedUrl
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
  return res.data.getPresignedUrlForAttachedFiles;
};
