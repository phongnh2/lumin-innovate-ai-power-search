import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { avoidOrphansWord } from 'utils/avoidOrphansWord';

import { ReasonFeedbackKey } from 'features/Feedback/constants';
import { useFeedbackContext } from 'features/Feedback/hooks';

import styles from './ReasonFeedback.module.scss';

const ReasonFeedback = () => {
  const {
    handleNextStep,
    feedbackFormHandler: { control },
  } = useFeedbackContext();
  const { t } = useTranslation();

  const reasonFeedbacks = [
    {
      key: ReasonFeedbackKey.UnreliableStorage,
      reason: t('shareDocumentFeedbackModal.reason1'),
    },
    {
      key: ReasonFeedbackKey.ConfusingUX,
      reason: t('shareDocumentFeedbackModal.reason2'),
    },
    {
      key: ReasonFeedbackKey.NoDemand,
      reason: t('shareDocumentFeedbackModal.reason3'),
    },
    {
      key: ReasonFeedbackKey.SpecificFeedback,
      reason: t('shareDocumentFeedbackModal.reason4'),
    },
  ];

  return (
    <>
      <Text
        className={styles.heading}
        component="h3"
        type="label"
        size="lg"
        color="var(--kiwi-colors-surface-on-surface)"
      >
        {avoidOrphansWord(t('shareDocumentFeedbackModal.question'))}
      </Text>
      <div className={styles.itemWrapper}>
        {reasonFeedbacks.map(({ reason, key }) => (
          <Controller
            control={control}
            name="reasonTag"
            key={key}
            render={({ field: { onChange, value } }) => (
              <div
                className={styles.item}
                data-selected={value === key}
                onClick={() => {
                  handleNextStep();
                  onChange(key);
                }}
                tabIndex={0}
                role="button"
              >
                <Text component="span" type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                  {reason}
                </Text>
              </div>
            )}
          />
        ))}
      </div>
    </>
  );
};

export default ReasonFeedback;
