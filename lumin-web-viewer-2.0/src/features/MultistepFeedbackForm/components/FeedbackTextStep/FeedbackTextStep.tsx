import { yupResolver } from '@hookform/resolvers/yup';
import { Textarea, Button } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'hooks/useTranslation';

import yup from 'utils/yup';

import { useMultistepFeedbackFormContext } from '../../hooks';
import FormModal from '../FormModal';

import styles from './FeedbackTextStep.module.scss';

const FEEDBACK_MAX_LENGTH = 2500;

const FeedbackTextStep = () => {
  const { t } = useTranslation();
  const { onSubmit, isSubmitting, isError } = useMultistepFeedbackFormContext();
  const validateSchema = useMemo(
    () =>
      yup.object().shape({
        feedback: yup
          .string()
          .trim()
          .max(FEEDBACK_MAX_LENGTH, t('errorMessage.maxLengthMessage', { length: FEEDBACK_MAX_LENGTH })),
      }),
    [t]
  );
  const { register, handleSubmit, formState } = useForm({
    mode: 'onBlur',
    defaultValues: {
      feedback: '',
    },

    resolver: yupResolver(validateSchema),
  });

  return (
    <>
      <FormModal.Title title={t('viewer.multiFeedbackForm.step2.title')} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Textarea
            id="feedbackFormInput"
            error={isError ? t('errorMessage.unknownError') : formState.errors.feedback?.message}
            rows={3}
            classNames={{
              root: styles.textareaContainer,
              wrapper: styles.textareaWrapper,
            }}
            placeholder={t('common.enterHere')}
            {...register('feedback')}
          />
        </div>
        <div className={styles.footerButtonContainer}>
          <Button
            loading={isSubmitting}
            type="submit"
            style={{
              minWidth: 80,
            }}
          >
            {t('action.submit')}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FeedbackTextStep;
