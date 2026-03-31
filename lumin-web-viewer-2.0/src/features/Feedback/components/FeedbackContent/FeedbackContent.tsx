import { Dialog, IconButton, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from 'luminComponents/Shared/ProgressBar';

import { avoidOrphansWord } from 'utils/avoidOrphansWord';

import { useFeedbackContext } from 'features/Feedback/hooks';
import { FeedbackStep } from 'features/Feedback/types';

import { TOTAL_FEEDBACK_FORMS } from '../../constants';
import { ReasonFeedback } from '../ReasonFeedback';
import { SpecificFeedback } from '../SpecificFeedback';
import { ThankForFeedback } from '../ThankForFeedback';

import styles from './FeedbackContent.module.scss';

const FeedbackContent = () => {
  const { t } = useTranslation();

  const { isOpenFeedback, closeFeedbackModal, handleNextStep, handlePrevStep, feedbackStep } =
    useFeedbackContext();

  const renderFeedbackContent = () => {
    switch (feedbackStep) {
      case FeedbackStep.Reason:
        return <ReasonFeedback />;
      case FeedbackStep.Specific:
        return <SpecificFeedback />;
      case FeedbackStep.ThankYou:
        return <ThankForFeedback />;
      default:
        return <ReasonFeedback />;
    }
  };

  const renderBackButton = () => {
    if (feedbackStep === FeedbackStep.Reason) {
      return <div className={styles.tempNavigation} />;
    }

    return (
      <PlainTooltip content={t('common.back')} position="bottom">
        <IconButton size="md" icon="arrow-narrow-left-md" onClick={handlePrevStep} />
      </PlainTooltip>
    );
  };

  const renderNextButton = () => {
    if ([FeedbackStep.Specific, FeedbackStep.ThankYou].includes(feedbackStep)) {
      return <div className={styles.tempNavigation} />;
    }

    return (
      <PlainTooltip content={t('common.next')} position="bottom">
        <IconButton size="md" icon="arrow-narrow-right-md" onClick={handleNextStep} />
      </PlainTooltip>
    );
  };

  const renderContent = () => (
    <>
      <div className={styles.headerContainer}>
        <Text component="h2" type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('shareDocumentFeedbackModal.title')}
        </Text>
        <IconButton size="lg" icon="x-lg" onClick={closeFeedbackModal} className={styles.closeButton} />
      </div>
      <Text className={styles.description} type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {avoidOrphansWord(t('shareDocumentFeedbackModal.description'))}
      </Text>
      <div className={styles.contentContainer}>
        {feedbackStep !== FeedbackStep.ThankYou && (
          <ProgressBar width={`${(feedbackStep / TOTAL_FEEDBACK_FORMS) * 100}%`} className={styles.progress} />
        )}
        {renderFeedbackContent()}
        {feedbackStep <= TOTAL_FEEDBACK_FORMS && (
          <div className={styles.navigation}>
            {renderBackButton()}
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {feedbackStep}/{TOTAL_FEEDBACK_FORMS}
            </Text>
            {renderNextButton()}
          </div>
        )}
      </div>
    </>
  );

  return (
    isOpenFeedback && (
      <Dialog
        opened
        centered
        size="md"
        withCloseButton={false}
        onClose={closeFeedbackModal}
        style={{ '--modal-size': '560px' }}
      >
        {renderContent()}
      </Dialog>
    )
  );
};

export default FeedbackContent;
