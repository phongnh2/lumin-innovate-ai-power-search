import { gql } from '@apollo/client';

import { client } from '@app-apollo';
import Axios from '@libs/axios';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { EDITOR_BACKEND_BASE_URL } from 'constants/urls';

export interface ProcessDocumentForChatbotPayload {
  needToUpload: boolean;
  putObjectUrl: string;
}

export const processDocumentForChatbot = async (
  input: { documentId: string; requestNewPutObjectUrl?: boolean },
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.query<{
    processDocumentForChatbot: ProcessDocumentForChatbotPayload;
  }>({
    query: gql`
      query processDocumentForChatbot($input: ProcessDocumentForChatbotInput!) {
        processDocumentForChatbot(input: $input) {
          needToUpload
          putObjectUrl
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
  return res.data.processDocumentForChatbot;
};

export const submitChatbotUserFeedBack = async (data: {
  traceId: string;
  feedback: {
    feedbackType: string;
    content: string;
    reason: string;
  };
}) => {
  try {
    return await Axios.editorInstance.post('/chat/user-feedback', data, {
      baseURL: EDITOR_BACKEND_BASE_URL,
    });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.SUBMIT_CHATBOT_USER_FEEDBACK_ERROR,
      error: error as Error,
    });
    throw error;
  }
};
