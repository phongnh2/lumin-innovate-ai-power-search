import { useMutation } from '@tanstack/react-query';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import logger from 'helpers/logger';

import { updateDocumentSummarization } from '../apis/updateDocumentSummarization';
import { DocumentSummarizationVote } from '../enum';
import { IDocumentSummarized } from '../interfaces';

export const useFeedbackSummarization = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const documentId = currentDocument._id;

  const updateSummarization = async (vote: DocumentSummarizationVote): Promise<IDocumentSummarized> => {
    try {
      return await updateDocumentSummarization({
        documentId,
        input: {
          vote,
        },
      });
    }
    catch (error: unknown) {
      logger.logError({ error });
    }
  };

  const {
    isLoading,
    data,
    error,
    mutate,
    mutateAsync,
  } = useMutation({
    mutationFn: updateSummarization,
  });

  return { isLoading, data, error, mutate, mutateAsync };
};
