import { getPageText } from 'core/getPageText';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { convertToReadAloudSentence } from '../utils/convertToReadAloudSentence';

export const useGetReadAloudSentences = () => {
  const getSentences = async (pageNumber: number) => {
    try {
      const pageText = await getPageText(pageNumber);

      const sentences = convertToReadAloudSentence({ pageText, pageNumber });

      return sentences ?? [];
    } catch (error: unknown) {
      logger.logError({ reason: LOGGER.Service.READ_ALOUD, error });
    }
  };

  return { getSentences };
};
