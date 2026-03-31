import { useQuery } from '@tanstack/react-query';
import produce from 'immer';
import { useDispatch, useSelector } from 'react-redux';

import { updateCurrentUser } from 'actions/authActions';
import { setIsRegeneratingSummary, setIsSummarizing } from 'actions/exposedActions';
import * as userActions from 'actions/userActions';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { getAllPageText } from 'utils/getAllPageText';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { useCheckExploringFeature } from 'features/EnableToolFromQueryParams/hooks/useExploringFeature';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { useSummarizeCompleted } from './useSummarizeCompleted';
import { getDocumentSummarization } from '../apis/getDocumentSummarization';
import { SummarizationContentRequire, SummarizationErrorTypes, SummarizeErrorType } from '../constants';
import { DocumentSummarizationStatus, SummarizationAvailability } from '../enum';
import { ISummarizedError, IDocumentSummarized } from '../interfaces';
import { getSummaryErrorCode } from '../utils';
import { SummaryTextContentError } from '../utils/customError';

export const useGetSummarization = (isRegenerate: boolean) => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isExploringFeature = useCheckExploringFeature({ pdfAction: PdfAction.SUMMARIZATION });
  const isSummarizing = useSelector(selectors.getIsSummarizing);
  const documentId = currentDocument._id;

  const { summarizedCompleted } = useSummarizeCompleted();

  const summarizedErrorCode = sessionStorage.getItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE) as SummarizeErrorType;

  const findErrorCodeKey = (errorCode: string) =>
    Object.keys(SummarizationErrorTypes).find((key: SummarizeErrorType) => SummarizationErrorTypes[key] === errorCode);

  const setSummarizedErrorCode = (error: SummarizeErrorType | string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE, error);
  };

  const updateUserMetadata = () => {
    if (!isExploringFeature) {
      return;
    }
    const updatedUserMetadata = produce(currentUser.metadata, (draft) => {
      draft.exploredFeatures.summarization += 1;
    });
    dispatch(userActions.updateUserMetadata(updatedUserMetadata));
  };

  const regenerateSummarization = async (): Promise<IDocumentSummarized> => {
    try {
      dispatch(setIsRegeneratingSummary(false));
      const textByPages = await getAllPageText();
      const combinedText = textByPages.join('');

      if (combinedText.length < SummarizationContentRequire.MIN) {
        throw new SummaryTextContentError(SummarizationErrorTypes.INSUFFICIENT_TEXT);
      }

      if (combinedText.length > SummarizationContentRequire.MAX) {
        setSummarizedErrorCode(`${SummarizationErrorTypes.CONTENT_LENGTH_EXCEEDED}-${combinedText.length}`);
        throw new SummaryTextContentError(SummarizationErrorTypes.CONTENT_LENGTH_EXCEEDED);
      }

      const regeneratedSummary = await getDocumentSummarization({
        documentId,
        options: {
          regenerate: {
            text: combinedText,
          },
        },
      });
      updateUserMetadata();

      if (regeneratedSummary.status === DocumentSummarizationStatus.PROCESSING) {
        const summarizedBySocket = await summarizedCompleted();

        if (summarizedBySocket.status.error_code) {
          setSummarizedErrorCode(summarizedBySocket.status.error_code);
          dispatch(setIsSummarizing(false));
          return null;
        }

        sessionStorage.removeItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE);
        const summarized: IDocumentSummarized = {
          content: summarizedBySocket.content,
          vote: null,
          status: DocumentSummarizationStatus.COMPLETED,
          availability: SummarizationAvailability.EXISTING,
          documentVersion: currentDocument.version,
        };

        dispatch(setIsSummarizing(false));
        return summarized;
      }
    } catch (error: unknown) {
      const { errorCode } = getSummaryErrorCode(error);
      if (errorCode !== findErrorCodeKey(SummarizationErrorTypes.CONTENT_LENGTH_EXCEEDED)) {
        setSummarizedErrorCode(errorCode);
      }
      dispatch(setIsSummarizing(false));
      return null;
    }
  };

  const getSummarization = async (): Promise<IDocumentSummarized> => {
    try {
      dispatch(setIsSummarizing(true));

      // Regenerate summarize
      if (isRegenerate) {
        return await regenerateSummarization();
      }

      // Get summarize
      const summary = await getDocumentSummarization({ documentId });

      // Summarize for the first time
      if (summary.availability === SummarizationAvailability.NONE) {
        dispatch(updateCurrentUser({ metadata: { docSummarizationConsentGranted: true } }));
        return await regenerateSummarization();
      }
      // Summarized before
      sessionStorage.removeItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE);
      dispatch(setIsSummarizing(false));
      updateUserMetadata();
      return summary;
    } catch (error: unknown) {
      const { errorCode } = getSummaryErrorCode(error);
      setSummarizedErrorCode(errorCode);
      dispatch(setIsSummarizing(false));
    }
  };

  const { data, refetch } = useQuery<IDocumentSummarized, ISummarizedError>({
    queryKey: ['DOCSUM_GET', documentId],
    queryFn: getSummarization,
  });

  return {
    isSummarizing,
    documentSummarized: data,
    summarizedError: summarizedErrorCode,
    refetchSummary: refetch,
  };
};
