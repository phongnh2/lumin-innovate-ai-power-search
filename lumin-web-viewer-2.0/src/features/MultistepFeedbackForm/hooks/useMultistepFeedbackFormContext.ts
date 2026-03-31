import { createContext, useContext } from 'react';

type MultistepFeedbackFormContextType = {
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: ({ feedback }: { feedback: string }) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onScoreChange: (score: number) => void;
  score: number;
  isSubmitting: boolean;
  isError: boolean;
  onClose: () => void;
};

export const MultistepFeedbackFormContext = createContext<MultistepFeedbackFormContextType | undefined>(undefined);

export const useMultistepFeedbackFormContext = () => useContext(MultistepFeedbackFormContext);
