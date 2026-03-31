import gql from 'graphql-tag';

import { client } from '@app-apollo';

const CREATE_UPLOAD_PRESIGNED_URL_FOR_SUMMARIZATION = gql`
  query createUploadPresignedUrlForSummarization($documentId: String) {
    createUploadPresignedUrlForSummarization(documentId: $documentId) {
      url
      fields {
        key
      }
    }
  }
`;

export const createUploadPresignedUrlForSummarization = async (documentId: string) => {
  const result = await client.query<{
    createUploadPresignedUrlForSummarization: {
      url: string;
      fields: {
        key: string;
      };
    };
  }>({
    query: CREATE_UPLOAD_PRESIGNED_URL_FOR_SUMMARIZATION,
    fetchPolicy: 'no-cache',
    variables: {
      documentId,
    },
  });

  return result.data.createUploadPresignedUrlForSummarization;
};
