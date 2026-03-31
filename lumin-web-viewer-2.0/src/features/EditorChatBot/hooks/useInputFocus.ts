import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useKey } from 'react-use';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';

import isFocusingElement from 'helpers/isFocusingElement';

type UseInputFocusProps = {
  inputRef: React.RefObject<HTMLDivElement>;
};

export const useInputFocus = ({ inputRef }: UseInputFocusProps): void => {
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isChatBotOpen = rightPanelValue === LayoutElements.CHATBOT && isRightPanelOpen;
  const isChatBotOpenRef = useLatestRef(isChatBotOpen);

  // Focus input when '/' key is pressed, but only if:
  // - The chat bot is currently open
  // - The input is not already focused
  // - No other interactive element has focus
  const handleFocusInput = (e: KeyboardEvent): void => {
    if (!isChatBotOpenRef.current || !inputRef.current) {
      return;
    }

    const isInputAlreadyFocused = document.activeElement === inputRef.current;
    const isOtherElementFocused = isFocusingElement();

    if (!isInputAlreadyFocused && !isOtherElementFocused) {
      e.preventDefault();
      inputRef.current.focus();
    }
  };

  // Blur input when 'Escape' key is pressed, but only if:
  // - The chat bot is currently open
  // - The input is currently focused
  const handleBlurInput = (e: KeyboardEvent): void => {
    if (!isChatBotOpenRef.current || !inputRef.current) {
      return;
    }

    const isInputFocused = document.activeElement === inputRef.current;

    if (isInputFocused) {
      e.preventDefault();
      inputRef.current.blur();
    }
  };

  useKey('/', handleFocusInput);
  useKey('Escape', handleBlurInput);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);
};
