import { gql } from '@apollo/client';

import { client } from '@app-apollo';

import { CompressOptionsType } from '../types';

export interface GetCompressDocumentPresignedUrlPayload {
  url: string;
  fields: { [key: string]: string };
}

export const getCompressDocumentPresignedUrl = async ({
  sessionId,
  documentId,
  compressOptions,
  options,
}: {
  sessionId: string;
  documentId: string;
  compressOptions: CompressOptionsType;
  options?: { signal: AbortController['signal'] };
}) => {
  const { signal } = options || {};
  const res = await client.query<{
    getCompressDocumentPresignedUrl: GetCompressDocumentPresignedUrlPayload;
  }>({
    query: gql`
      query getCompressDocumentPresignedUrl($input: GetCompressDocumentPresignedUrlInput!) {
        getCompressDocumentPresignedUrl(input: $input) {
          url
          fields {
            key
          }
        }
      }
    `,
    variables: {
      input: {
        sessionId,
        documentId,
        compressOptions,
      },
    },
    fetchPolicy: 'no-cache',
    context: {
      fetch: {
        signal,
      },
    },
  });
  return res.data.getCompressDocumentPresignedUrl;
};
