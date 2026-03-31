import React from 'react';

import MultiStepFeedbackForm from './MultiStepFeedbackForm';
import MultiStepFeedbackFormProvider from '../MultiStepFeedbackFormProvider';

type MultiStepFeedbackFormWithProviderProps = {
  onClose: () => void;
};

const MultiStepFeedbackFormWithProvider = (props: MultiStepFeedbackFormWithProviderProps) => (
  <MultiStepFeedbackFormProvider
    extraProps={{
      onClose: props.onClose,
    }}
  >
    <MultiStepFeedbackForm />
  </MultiStepFeedbackFormProvider>
);
export default MultiStepFeedbackFormWithProvider;
