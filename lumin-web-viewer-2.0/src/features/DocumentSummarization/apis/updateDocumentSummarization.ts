import gql from 'graphql-tag';

import { client } from '@app-apollo';

import { IUpdateSummarization } from '../interfaces';

const UPDATE_DOCUMENT_SUMMARIZATION = gql`
  mutation updateDocumentSummarization(
    $documentId: ID!,
    $input: UpdateDocSummarizationInput!
  ){
    updateDocumentSummarization(documentId: $documentId, input: $input) {
      content
      vote
    }
  }
`;

export const updateDocumentSummarization = async (data: IUpdateSummarization) => {
  const response = await client.query<{
    getDocumentSummarization: {
      content: string,
      vote: string,
    }
  }>({
    query: UPDATE_DOCUMENT_SUMMARIZATION,
    fetchPolicy: 'no-cache',
    variables: {
      documentId: data.documentId,
      input: data.input,
    },
  });

  return response.data.getDocumentSummarization;
};