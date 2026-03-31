import { useState } from 'react';

export const useFocusManager = (resetSelectedMark: () => void) => {
  const [focusInput, setFocusInput] = useState(false);

  const handleWrapperBlur = () => {
    setFocusInput(false);
    resetSelectedMark();
  };

  const handleWrapperFocus = () => {
    setFocusInput(true);
  };

  const handleInputFocus = () => {
    setFocusInput(true);
  };

  return {
    focusInput,
    handleWrapperBlur,
    handleWrapperFocus,
    handleInputFocus,
  };
};
