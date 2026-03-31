import { useMutation } from '@tanstack/react-query';

import formFieldDetectionEventCollection from 'utils/Factory/EventCollection/FormFieldDetectionEventCollection';

const recordEvent = async ({ score, content }: { score: number; content: string }) => {
  if (score > 0) {
    await formFieldDetectionEventCollection.surveyResponse({ answer: score, feedback: content });
  }
};

export const useSubmitFeedback = () => {
  const { isLoading, mutateAsync, isError } = useMutation({
    mutationFn: async ({ score, content }: { score: number; content: string }) => recordEvent({ score, content }),
    mutationKey: ['submitFeedback'],
  });
  return {
    loading: isLoading,
    isError,
    mutateAsync,
  };
};
