import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { GiveSummarizeFeedbackURL, WarningUseSummarizeURL } from 'features/DocumentSummarization/constants';

import * as Styled from './DocumentSummarization.styled';

interface ISummarizationFooter {
  onReGenerate?: () => void;
  isSummarizing: boolean;
  isSummarizeFailed: boolean;
}

const SummarizationFooter = (props: ISummarizationFooter) => {
  const { isSummarizing, isSummarizeFailed, onReGenerate } = props;
  const { t } = useTranslation();

  const renderSummarizationFooter = () => {
    if (isSummarizing) {
      return (
        <Styled.FooterLoadingText>
          <Trans
            i18nKey="viewer.summarization.warning"
            components={{ Link: <Styled.LoadingLink target="_blank" href={WarningUseSummarizeURL} /> }}
          />
        </Styled.FooterLoadingText>
      );
    }

    if (isSummarizeFailed) {
      return (
        <Styled.FeedbackLink href={GiveSummarizeFeedbackURL} target="_blank">
          {t('viewer.summarization.feedback.btn')}
        </Styled.FeedbackLink>
      );
    }

    return (
      <>
        <Styled.FeedbackLink href={GiveSummarizeFeedbackURL} target="_blank">
          {t('viewer.summarization.feedback.btn')}
        </Styled.FeedbackLink>
        <Button data-lumin-btn-name={ButtonName.REGENERATE} variant="tonal" size="lg" onClick={onReGenerate}>
          {t('viewer.summarization.reGenerate')}
        </Button>
      </>
    );
  };

  return <Styled.BottomWrapper $isSummarizing={isSummarizing}>{renderSummarizationFooter()}</Styled.BottomWrapper>;
};

export default SummarizationFooter;
