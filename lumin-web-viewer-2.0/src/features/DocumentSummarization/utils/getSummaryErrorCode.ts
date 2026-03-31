import { ApolloError } from '@apollo/client';

import errorExtract from 'utils/error';

import { SummarizeErrorType } from '../constants';

export const getSummaryErrorCode = (error: unknown) => {
  if (error instanceof ApolloError) {
    const { code } = errorExtract.extractGqlError(error) as { code: SummarizeErrorType };
    return { errorCode: code };
  }
  if (error instanceof Error) {
    return { errorCode: error.name };
  }
};
