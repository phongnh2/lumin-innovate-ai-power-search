import React from 'react';
import { useTranslation } from 'react-i18next';

import GeneratingSummary from 'assets/images/hour-glass-loading.png';

import * as Styled from './DocumentSummarization.styled';

const SummarizationLoading = () => {
  const { t } = useTranslation();
  return (
    <Styled.LoadingWrapper>
      <Styled.Image src={GeneratingSummary} alt="summary-loading" />
      <Styled.LoadingContent>
        {t('viewer.summarization.loading')
          .split(' ')
          .map((splitedText: string, index: number) => (
            <Styled.LoadingTextSplited key={`${splitedText}-${index}`} index={index}>
              {splitedText}
            </Styled.LoadingTextSplited>
          ))}
        <Styled.LoadingDot />
        <Styled.LoadingDot />
        <Styled.LoadingDot />
      </Styled.LoadingContent>
    </Styled.LoadingWrapper>
  );
};

export default SummarizationLoading;
