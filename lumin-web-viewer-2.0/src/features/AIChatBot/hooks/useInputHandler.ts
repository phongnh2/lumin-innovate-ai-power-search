import React from 'react';

interface UseInputHandlerProps {
  inputRef: React.RefObject<HTMLDivElement>;
  setValueState: (value: string) => void;
  onSubmit?: () => void;
  disabledSubmit?: boolean;
  isProcessing?: boolean;
  removeSelectedMark: () => void;
  isUploadingFiles?: boolean;
}

export const useInputHandler = ({
  inputRef,
  setValueState,
  onSubmit,
  disabledSubmit,
  isProcessing,
  removeSelectedMark,
  isUploadingFiles,
}: UseInputHandlerProps) => {
  const handleInput = () => {
    if (!inputRef.current) {
      return;
    }
    const { innerText } = inputRef.current;
    const textContent = innerText.trim();
    setValueState(textContent);
    if (textContent === '') {
      inputRef.current.innerHTML = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isEnterKey = event.key === 'Enter';
    const isShiftKey = event.shiftKey;

    removeSelectedMark();

    if (isEnterKey && isShiftKey) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (onSubmit && !disabledSubmit && !isProcessing && !isUploadingFiles) {
        onSubmit();
      }
    }
  };

  return {
    handleInput,
    handleKeyDown,
  };
};
