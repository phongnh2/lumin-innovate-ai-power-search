import { createContext, Dispatch, SetStateAction } from 'react';

import { FocusState } from '../types';

interface ILuminCommentBoxContext {
  isSelected: boolean;
  isResolved: boolean;
  closeCommentPopup: () => void;
  focusingInputValue: FocusState;
  setFocusingInputValue: Dispatch<SetStateAction<FocusState>>;
  onCompositionChange: (hasContent: boolean) => void;
  isButtonDisabled: boolean;
}

export const LuminCommentBoxContext = createContext<ILuminCommentBoxContext | null>(null);
