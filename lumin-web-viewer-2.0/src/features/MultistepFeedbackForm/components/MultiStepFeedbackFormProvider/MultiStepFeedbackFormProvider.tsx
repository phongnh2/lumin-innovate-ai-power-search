import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useCleanup } from 'hooks';

import { useSubmitFeedback } from 'features/MultistepFeedbackForm/hooks';

import { MultistepFeedbackFormContext } from '../../hooks/useMultistepFeedbackFormContext';

const AUTO_CLOSE_TIME = 10 * 1000;

const MultiStepFeedbackFormProvider = ({
  children,
  extraProps,
}: {
  children: React.ReactNode;
  extraProps: {
    onClose: () => void;
  };
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onNext = () => setActiveStep((prev) => prev + 1);

  const onPrevious = () => setActiveStep((prev) => prev - 1);

  const { loading, mutateAsync: submitFeedback, isError } = useSubmitFeedback();

  const onClose = useCallback(() => {
    const feedback = (document.getElementById('feedbackFormInput') as HTMLInputElement)?.value || '';
    submitFeedback({ score, content: feedback }).catch(console.error);
    extraProps.onClose();
  }, [extraProps, submitFeedback]);

  const onSubmit = useCallback(
    ({ feedback }: { feedback: string }) => {
      submitFeedback({ score, content: feedback }).catch(console.error);
      onNext();

      timer.current = setTimeout(() => onClose(), AUTO_CLOSE_TIME);
    },
    [onClose, score, submitFeedback]
  );

  const onScoreChange = (_score: number) => setScore(_score);

  useCleanup(() => clearTimeout(timer.current), []);

  const contextValue = useMemo(
    () => ({
      onNext,
      onPrevious,
      onSubmit,
      activeStep,
      setActiveStep,
      onScoreChange,
      score,
      isSubmitting: loading,
      isError,
      ...extraProps,
      onClose,
    }),
    [activeStep, isError, extraProps, loading, onSubmit, score, onClose]
  );

  return <MultistepFeedbackFormContext.Provider value={contextValue}>{children}</MultistepFeedbackFormContext.Provider>;
};

export default MultiStepFeedbackFormProvider;
