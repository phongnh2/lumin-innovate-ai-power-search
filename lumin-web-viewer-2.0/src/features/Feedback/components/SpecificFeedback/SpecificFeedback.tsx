import { Textarea, Button as KiwiButton, Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFeedbackContext } from 'features/Feedback/hooks';

import styles from './SpecificFeedback.module.scss';

const SpecificFeedback = () => {
  const {
    feedbackFormHandler: { register, formState, clearErrors },
    onFeedbackFormSubmit,
  } = useFeedbackContext();
  const { t } = useTranslation();

  const formErrorMessage = formState.errors?.specificFeedback?.message || '';

  const handlePreventHotKeys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.container}>
      <Text
        className={styles.heading}
        component="h3"
        type="label"
        size="lg"
        color="var(--kiwi-colors-surface-on-surface)"
      >
        {t('shareDocumentFeedbackModal.improvementQuestion')}
      </Text>
      <Textarea
        size="sm"
        classNames={{
          error: styles.textareaError,
          wrapper: styles.textareaWrapper,
        }}
        className={styles.feedbackTextarea}
        placeholder={t('common.enterHere')}
        {...register('specificFeedback', {
          onChange: () => {
            clearErrors('specificFeedback');
          },
        })}
        error={formErrorMessage}
        autoFocus
        onKeyDown={handlePreventHotKeys}
        rows={8}
      />
      <KiwiButton
        mt={8}
        className={styles.doneButton}
        size="md"
        variant="filled"
        startIcon={<Icomoon type="check-md" size="md" color="var(--kiwi-colors-core-on-secondary)" />}
        onClick={onFeedbackFormSubmit}
      >
        {t('common.done')}
      </KiwiButton>
    </div>
  );
};

export default SpecificFeedback;
