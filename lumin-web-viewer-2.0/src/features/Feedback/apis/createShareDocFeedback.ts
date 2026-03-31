import { gql } from '@apollo/client';

import { client } from '@app-apollo';

export const CREATE_SHARE_DOC_FEEDBACK = gql`
  mutation createShareDocFeedback($input: CreateShareDocFeedbackInput!) {
    createShareDocFeedback(input: $input) {
      statusCode
    }
  }
`;

export const createShareDocFeedback = async ({
  satisfiedCategory,
  reasonTag,
  specificFeedback,
}: {
  satisfiedCategory?: string;
  reasonTag?: string;
  specificFeedback?: string;
}) =>
  client.mutate({
    mutation: CREATE_SHARE_DOC_FEEDBACK,
    variables: {
      input: {
        satisfiedCategory: satisfiedCategory || null,
        reasonTag: reasonTag || null,
        specificFeedback,
      },
    },
  });
