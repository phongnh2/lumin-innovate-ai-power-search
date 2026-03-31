import core from 'core';
import selectors from 'selectors';
import { RootState, store } from 'store';

import isFocusingElement from 'helpers/isFocusingElement';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import setToolModeAndGroup from 'helpers/setToolModeAndGroup';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { DataElements } from 'constants/dataElement';

export const panModeKeyDownHandler = ({ e, state }: { e: KeyboardEvent; state: RootState }) => {
  const isInContentEditMode = selectors.isInContentEditMode(state);
  const selectedTextFromCanvas = core.getSelectedText();
  const isOpenLoadingModal = selectors.isElementOpen(state, DataElements.VIEWER_LOADING_MODAL);
  const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(state);
  const shouldDisablePanMode =
    isFocusingElement() ||
    isInContentEditMode ||
    selectedTextFromCanvas ||
    isOpenLoadingModal ||
    isPreviewOriginalVersionMode;

  if (shouldDisablePanMode) {
    return;
  }

  if (e.key === 'p' || e.which === 80) {
    const shouldPreventEvent =
      toggleFormFieldCreationMode() ||
      promptUserChangeToolMode({
        callback: () => {
          setToolModeAndGroup(store, 'Pan');
        },
      });
    if (!shouldPreventEvent) {
      setToolModeAndGroup(store, 'Pan');
    }
  }
};
