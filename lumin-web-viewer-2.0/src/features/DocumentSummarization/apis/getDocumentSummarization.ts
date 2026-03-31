import gql from 'graphql-tag';

import { client } from '@app-apollo';

import { DocumentSummarizationStatus, SummarizationAvailability } from '../enum';
import { IDocumentSummarized, IGetDocumentSummarization } from '../interfaces';

const GET_DOCUMENT_SUMMARIZATION = gql`
  query getDocumentSummarization($documentId: ID!, $options: GetDocSummarizationOptions) {
    getDocumentSummarization(documentId: $documentId, options: $options) {
      content
      vote
      status
      availability
      documentVersion
    }
  }
`;

export const getDocumentSummarization = async (input: IGetDocumentSummarization): Promise<IDocumentSummarized> => {
  const response = await client.query<{
    getDocumentSummarization: {
      content: string,
      vote: string,
      status: DocumentSummarizationStatus,
      availability: SummarizationAvailability,
      documentVersion: number,
    }
  }>({
    query: GET_DOCUMENT_SUMMARIZATION,
    fetchPolicy: 'no-cache',
    variables: {
      documentId: input.documentId,
      options: input.options,
    },
  });

  return response.data.getDocumentSummarization as IDocumentSummarized;
};