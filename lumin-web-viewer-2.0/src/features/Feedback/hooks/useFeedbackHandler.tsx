import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TFunction, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import logger from 'helpers/logger';

import yup from 'utils/yup';

import { createShareDocFeedback } from '../apis/createShareDocFeedback';
import { TEXT_AREA_MAX_LENGTH } from '../constants';
import { FeedbackStep } from '../types';

const createShareDocFeedbackSchema = (t: TFunction) =>
  yup.object().shape({
    satisfiedCategory: yup.string(),
    reasonTag: yup.string(),
    specificFeedback: yup
      .string()
      .max(TEXT_AREA_MAX_LENGTH, t('errorMessage.maxLengthMessage', { length: TEXT_AREA_MAX_LENGTH })),
  });

type CreateShareDocSchema = yup.InferType<ReturnType<typeof createShareDocFeedbackSchema>>;

const defaultFormValues = {
  satisfiedCategory: '',
  reasonTag: '',
  specificFeedback: '',
};

export const useFeedbackHandler = ({
  onClose,
  onSubmitSuccess,
  onOpen,
}: {
  onClose?: () => void;
  onSubmitSuccess?: () => void;
  onOpen?: () => void;
}) => {
  const [isOpenFeedback, setIsOpenFeedback] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [feedbackStep, setFeedbackStep] = useState<FeedbackStep>(FeedbackStep.Reason);

  const isSubmittedForm = useRef(false);

  const feedbackFormHandler = useForm<CreateShareDocSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: yupResolver(createShareDocFeedbackSchema(t)),
    defaultValues: defaultFormValues,
  });

  const handleNextStep = () => {
    setFeedbackStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setFeedbackStep((prevStep) => prevStep - 1);
  };

  const onFeedbackFormSubmit = feedbackFormHandler.handleSubmit(
    async (data: { satisfiedCategory?: string; reasonTag?: string; specificFeedback?: string }, event) => {
      const isAnyFieldValid = Object.values(data).some((value) => value && value.trim() !== '');

      if (!isAnyFieldValid) {
        return;
      }

      // click done button
      if (event) {
        handleNextStep();
      }

      try {
        isSubmittedForm.current = true;
        await createShareDocFeedback({ ...data });
        onSubmitSuccess?.();
      } catch (err) {
        logger.logError({
          message: 'Failed to create share doc feedback',
          error: err,
        });
      }
    }
  );

  useEffect(() => {
    if (isOpenFeedback) {
      isSubmittedForm.current = false;
      feedbackFormHandler.reset(defaultFormValues);
    }
  }, [isOpenFeedback]);

  const closeFeedbackModal = () => {
    if (!isSubmittedForm.current) {
      onFeedbackFormSubmit().finally(() => {});
    }
    setIsOpenFeedback(false);
    setFeedbackStep(FeedbackStep.Reason);
    onClose?.();
  };

  const openFeedbackModal = () => {
    dispatch(actions.closeModal());
    setIsOpenFeedback(true);
    onOpen?.();
  };

  return {
    feedbackStep,
    isOpenFeedback,
    closeFeedbackModal,
    handleNextStep,
    handlePrevStep,
    setFeedbackStep,
    feedbackFormHandler,
    onFeedbackFormSubmit,
    openFeedbackModal,
  };
};
