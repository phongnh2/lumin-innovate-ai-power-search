import { IconButton } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';

import { useMultistepFeedbackFormContext } from 'features/MultistepFeedbackForm/hooks';

import FeedbackTextStep from '../FeedbackTextStep';
import FormModal from '../FormModal';
import RatingStep from '../RatingStep';
import ThankYouStep from '../ThankYouStep';

import styles from './MultiStepFeedbackForm.module.scss';

const MultiStepFeedbackForm = () => {
  const { activeStep, onClose } = useMultistepFeedbackFormContext();

  const renderContent = useCallback(
    () =>
      [null, <RatingStep key="rating" />, <FeedbackTextStep key="feedback" />, <ThankYouStep key="thankyou" />][
        activeStep
      ],
    [activeStep]
  );

  if (!activeStep) {
    return null;
  }

  return (
    <FormModal>
      <IconButton onClick={onClose} className={styles.closeIcon} icon="x-md" />
      {renderContent()}
    </FormModal>
  );
};

export default MultiStepFeedbackForm;
