import { Chip, Button, ButtonVariant, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import BaseCancellationPage from 'features/CNC/CncComponents/BaseCancellationPage';

import FollowUpQuestion from './components/FollowUpQuestion';
import { FOLLOW_UP_QUESTIONS, FOLLOW_UP_QUESTIONS_ID } from './constant';
import useHandleCancelWithFollowUpQuestion from './hooks/useHandleCancelWithFollowUpQuestion';

import styles from './SurveySubscription.module.scss';

const SurveySubscription = () => {
  const { t } = useTranslation();
  const {
    pdfUsageFrequency,
    setPdfUsageFrequency,
    followUpQuestion,
    setFollowUpQuestion,
    feedback,
    setFeedback,
    usingTools,
    setUsingTools,
    onSubmitWithFollowUpQuestion,
    trackPageFollowUpQuestionViewed,
    setSliderValue,
  } = useHandleCancelWithFollowUpQuestion();
  const disabledContinueButton = !(pdfUsageFrequency && followUpQuestion);
  const shouldRenderFollowUpDescription = Boolean(followUpQuestion);
  const shouldRenderFollowUpSubQuestion = Boolean(shouldRenderFollowUpDescription && followUpQuestion?.subQuestion);
  const shouldRenderSlider = followUpQuestion?.value === FOLLOW_UP_QUESTIONS_ID.TOO_EXPENSIVE;

  useEffect(() => {
    trackPageFollowUpQuestionViewed();
  }, []);

  const getQuestionData = () =>
    FOLLOW_UP_QUESTIONS.map((option) => ({
      value: option.value,
      label: t(option.label),
      subQuestion: t(option.subQuestion),
      followUpDescription: t(option.followUpDescription),
    }));

  return (
    <BaseCancellationPage>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.chipWrapper}>
            <Chip
              label={t('surveySubscription.stepper', { step: 1, total: 2 })}
              variant="light"
              size="md"
              colorType="white"
              rounded
            />
          </div>
          <div>
            <div className={styles.title}>{t('surveySubscription.title')}</div>
            <div className={styles.description}>{t('surveySubscription.description')}</div>
          </div>
          <div className={styles.body}>
            <FollowUpQuestion
              t={t}
              getQuestionData={getQuestionData}
              followUpQuestion={followUpQuestion}
              setFollowUpQuestion={setFollowUpQuestion}
              setPdfUsageFrequency={setPdfUsageFrequency}
              setUsingTools={setUsingTools}
              setSliderValue={setSliderValue}
              shouldRenderFollowUpSubQuestion={shouldRenderFollowUpSubQuestion}
              shouldRenderFollowUpDescription={shouldRenderFollowUpDescription}
              shouldRenderSlider={shouldRenderSlider}
              feedback={feedback}
              setFeedback={setFeedback}
              usingTools={usingTools}
              pdfUsageFrequency={pdfUsageFrequency}
            />
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              variant={ButtonVariant.filled}
              size={ButtonSize.lg}
              onClick={onSubmitWithFollowUpQuestion}
              disabled={disabledContinueButton}
            >
              {t('common.continue')}
            </Button>
          </div>
        </div>
      </div>
    </BaseCancellationPage>
  );
};

export default SurveySubscription;
