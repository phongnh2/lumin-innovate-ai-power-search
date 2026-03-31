import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Divider from '@new-ui/general-components/Divider';
import { setCurrentSummaryDocVersion, setIsRegeneratingSummary } from 'actions/exposedActions';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { useEnabledSummarization } from 'features/DocumentSummarization';
import { useGetExistingSummarize } from 'features/DocumentSummarization/hooks/useGetExistingSummarize';
import { useGetSummarization } from 'features/DocumentSummarization/hooks/useGetSummarization';
import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { useCheckExploringFeature } from 'features/EnableToolFromQueryParams/hooks/useExploringFeature';
import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import SummarizationError from './SummarizationError';
import SummarizationFooter from './SummarizationFooter';
import SummarizationLoading from './SummarizationLoading';
import SummarizationResult from './SummarizationResult';

import * as Styled from './DocumentSummarization.styled';

const SummarizationContent = () => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isRegenerating = useSelector(selectors.getIsRegeneratingSummary);
  const currentSummaryDocVersion = useSelector(selectors.getCurrentSummaryDocVersion);
  const documentVersion = currentDocument?.version;
  const isExploringFeature = useCheckExploringFeature({ pdfAction: PdfAction.SUMMARIZATION });
  const { canSummary } = useEnabledSummarization();

  const { existingSummarize } = useGetExistingSummarize();

  const { isSummarizing, summarizedError, refetchSummary } = useGetSummarization(isRegenerating);

  const renderSummarizationContent = () => {
    if (isSummarizing) {
      return <SummarizationLoading />;
    }
    if (summarizedError) {
      return <SummarizationError apiError={summarizedError} />;
    }
    return <SummarizationResult />;
  };

  const isVersionChanged = () => {
    if (existingSummarize) {
      return documentVersion !== existingSummarize?.documentVersion;
    }
    return true;
  };

  const handleRegenerate = () => {
    if (!canSummary && !isExploringFeature) {
      dispatch(
        accessToolModalActions.openModal({
          toolName: TOOLS_NAME.DOCUMENT_SUMMARIZATION,
          eventName: PremiumToolsPopOverEvent.SummarizeDocument,
        })
      );
      return;
    }
    dispatch(setIsRegeneratingSummary(true));
  };

  useEffect(() => {
    if (isRegenerating) {
      refetchSummary().catch(() => {});
    }
  }, [isRegenerating]);

  useEffect(() => {
    if (
      !isSummarizing &&
      isVersionChanged() &&
      currentSummaryDocVersion &&
      currentSummaryDocVersion !== documentVersion
    ) {
      dispatch(setIsRegeneratingSummary(true));
    }

    dispatch(setCurrentSummaryDocVersion(documentVersion));
  }, [documentVersion, existingSummarize]);

  return (
    <>
      <Styled.ContentWrapper>{renderSummarizationContent()}</Styled.ContentWrapper>
      <Divider />
      <SummarizationFooter
        isSummarizing={isSummarizing}
        isSummarizeFailed={summarizedError !== null}
        onReGenerate={handleRegenerate}
      />
    </>
  );
};

export default SummarizationContent;
