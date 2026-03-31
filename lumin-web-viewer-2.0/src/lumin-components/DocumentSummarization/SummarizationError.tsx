import React from 'react';
import { useTranslation } from 'react-i18next';

import SummaryError from 'assets/images/summarize-error.svg';

import { SummarizationErrorTypes, SummarizeErrorType } from 'features/DocumentSummarization/constants';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import * as Styled from './DocumentSummarization.styled';

interface ISummarizationError {
  apiError?: SummarizeErrorType;
}

const SummarizationError = (props: ISummarizationError) => {
  const { apiError } = props;
  const { t } = useTranslation();
  const exceededContentLength = sessionStorage.getItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE).split('-')[1];
  const errorCode = exceededContentLength
    ? SummarizationErrorTypes.CONTENT_LENGTH_EXCEEDED
    : SummarizationErrorTypes[apiError] || SummarizationErrorTypes.THIRD_PARTY_ERROR;

  return (
    <Styled.LoadingWrapper>
      <Styled.Image src={SummaryError} alt="summary-error" />
      <Styled.MediumVariantText>
        {t(
          `viewer.summarization.errors.${errorCode}`,
          exceededContentLength && { count: parseInt(exceededContentLength) }
        )}
      </Styled.MediumVariantText>
    </Styled.LoadingWrapper>
  );
};

export default SummarizationError;
