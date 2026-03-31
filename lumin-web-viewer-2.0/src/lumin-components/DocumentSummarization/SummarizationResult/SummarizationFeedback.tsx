import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import Divider from '@new-ui/general-components/Divider';
import IconButton from '@new-ui/general-components/IconButton';
import Tooltip from '@new-ui/general-components/Tooltip';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { SummarizationDebounceActions } from 'features/DocumentSummarization/constants';
import { DocumentSummarizationVote } from 'features/DocumentSummarization/enum';
import { useFeedbackSummarization } from 'features/DocumentSummarization/hooks/useFeedbackSummarization';
import { useGetExistingSummarize } from 'features/DocumentSummarization/hooks/useGetExistingSummarize';

import * as Styled from './SummarizationResult.styled';

const SummarizationFeedback = () => {
  const { t } = useTranslation();

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const queryClient = useQueryClient();

  const { existingSummarize } = useGetExistingSummarize();

  const { mutate: mutateUpdateSummary } = useFeedbackSummarization();

  const [responingFeedback, setResponingFeedback] = useState(false);

  const debounceCloseResponingFeedback = useDebouncedCallback(() => setResponingFeedback(false), SummarizationDebounceActions.FEEDBACK);

  const onFeedback = (vote: DocumentSummarizationVote) => {
    setResponingFeedback(true);
    queryClient.setQueryData(['DOCSUM_GET', currentDocument._id], {
      ...existingSummarize,
      vote,
    });

    mutateUpdateSummary(vote);

    debounceCloseResponingFeedback();
  };

  const feedbackButtonProps = (vote: DocumentSummarizationVote) => (
    {
      active: vote === existingSummarize.vote,
      iconSize: 20,
      size: 'medium' as const,
      onClick: () => onFeedback(vote),
    }
  );

  if (existingSummarize.vote !== null && !responingFeedback) {
    return null;
  }

  return (
    responingFeedback ?
      <Styled.ResponseFeedback className='animate__animated animate__fadeInUp animate__faster	500ms'>
        <Styled.PrimaryText>{t('viewer.summarization.feedback.thank')}</Styled.PrimaryText>
        <IconButton
          icon="md_close"
          iconSize={24}
          onClick={() => setResponingFeedback(false)}
        />
      </Styled.ResponseFeedback>
    : <>
        <Divider />
        <Styled.ResultFooter>
          <Styled.Question>{t('viewer.summarization.feedback.question')}</Styled.Question>
          <Styled.ButtonGroup>
            <Tooltip
              title={t('viewer.summarization.feedback.like')}
              placement='bottom'
              disableHoverListener={existingSummarize.vote !== null}
            >
              <IconButton
                data-lumin-btn-name={ButtonName.THUMB_UP}
                icon="md_like"
                {...feedbackButtonProps(DocumentSummarizationVote.UPVOTED)}
              />
            </Tooltip>
            <Tooltip
              title={t('viewer.summarization.feedback.dislike')}
              placement='bottom'
              disableHoverListener={existingSummarize.vote !== null}
            >
              <IconButton
                data-lumin-btn-name={ButtonName.THUMB_DOWN}
                icon="md_dislike"
                {...feedbackButtonProps(DocumentSummarizationVote.DOWNVOTED)}
              />
            </Tooltip>
          </Styled.ButtonGroup>
        </Styled.ResultFooter>
      </>
  );
};

export default SummarizationFeedback;
