import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { activePrintButtonByHotKey } from 'helpers/activeButtonByHotKey';
import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';
import getCurrentRole from 'helpers/getCurrentRole';
import isFocusingElement from 'helpers/isFocusingElement';
import openFilePicker from 'helpers/openFilePicker';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import setActiveToolByHotkey from 'helpers/setActiveToolByHotkey';
import setToolModeAndGroup from 'helpers/setToolModeAndGroup';
import { zoomIn, zoomOut } from 'helpers/zoom';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import TOOLS_NAME from 'constants/toolsName';

import { focusModeToggleKeyDown } from './focusModeToggleKeyDown';
import { pageNavigationKeyDownHandler } from './pageNavigationKeyDownHandler';
import { panModeKeyDownHandler } from './panModeKeyDownHandler';
import { presenterToggleKeyDownHandler } from './presenterToggleKeyDownHandler';
import { quickSearchToggleKeydown } from './quickSearchToggleKeydown';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default (store) => async (e) => {
  const { dispatch, getState } = store;
  const state = getState();
  const selectedTextFromCanvas = core.getSelectedText();
  const selectedAnnotations = core.getSelectedAnnotations();
  const isOpenModalData = selectors.isOpenModalData(state);
  const isOpenRequireUseCommentModal = selectors.isElementOpen(state, 'requireUseCommentModal');
  const isOpenDialog = selectors.getIsDialogOpen(state);
  const isOpenSignatureModal = selectors.isElementOpen(state, 'signatureModal');
  const currentDocument = selectors.getCurrentDocument(state);
  const currentUser = selectors.getCurrentUser(state);
  const isInContentEditMode = selectors.isInContentEditMode(state);
  const isInReadAloudMode = readAloudSelectors.isInReadAloudMode(state);
  const isOverTimeLimit = currentDocument?.isOverTimeLimit;
  const isUsingRichText = selectors.isUsingRichText(state);
  const isAnnotationsLoaded = selectors.getAnnotationsLoaded(state);
  const isInPresenterMode = selectors.isInPresenterMode(state);

  const userRole = getCurrentRole(currentDocument);
  const canAddAnnotation =
    !core.isReadOnlyModeEnabled() &&
    [DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER].includes(userRole);

  if (e.shiftKey && selectedAnnotations.length > 0) {
    selectedAnnotations.forEach((selectedAnnotation) => {
      if (selectedAnnotation.Subject !== AnnotationSubjectMapping.stickyNote) {
        selectedAnnotation.MaintainAspectRatio = true;
      }
    });
  }

  const { activeElement } = window.document;

  const isFocusingChatBotInput = activeElement.id === 'chatBotInput';

  const preventTriggerKeyDownEvent =
    isOpenModalData ||
    isOpenRequireUseCommentModal ||
    isOpenDialog ||
    isOpenSignatureModal ||
    isOverTimeLimit ||
    isUsingRichText ||
    isInContentEditMode ||
    isInReadAloudMode ||
    !isAnnotationsLoaded ||
    isFocusingChatBotInput;

  if (e.key === 'Escape' || e.which === 27) { // (Esc)
    e.preventDefault();
    const isOpenContentEditModal = selectors.isElementOpen(state, 'contentEditModal');
    if (isOpenContentEditModal) {
      return;
    }
    const handleEscShortcut = () => {
      setToolModeAndGroup(store, TOOLS_NAME.EDIT);
      dispatch(actions.closeElements([
          'annotationPopup',
          'textPopup',
          'contextMenuPopup',
          'toolStylePopup',
          'annotationStylePopup',
          'signatureModal',
          'printModal',
          'searchOverlay',
          'rubberStampModule'
      ])
      );
    };

    if (isInContentEditMode) {
      core.setToolMode(TOOLS_NAME.EDIT);
      return;
    }

    const shouldPreventEvent = promptUserChangeToolMode({ callback: handleEscShortcut });
    if (!shouldPreventEvent) {
      handleEscShortcut();
    }
  }

  if (preventTriggerKeyDownEvent) {
    return;
  }

  pageNavigationKeyDownHandler(e);
  presenterToggleKeyDownHandler(e);
  quickSearchToggleKeydown({ e, state, dispatch });
  focusModeToggleKeyDown({ e, state, dispatch });
  panModeKeyDownHandler({ e, state });

  if (isInPresenterMode) {
    return;
  }

  if (e.metaKey || e.ctrlKey) {
    if (e.key === 'z' || e.which === 90) {
      const handleUndoRedo = () => {
        const careTaker = selectors.getCareTaker(state);
        if (e.shiftKey) {
          careTaker.redoAnnotation();
        } else {
          careTaker.undoAnnotation();
        }
      };
      const shouldPreventEvent = promptUserChangeToolMode({ callback: handleUndoRedo });
      if (shouldPreventEvent) {
        return;
      }
      handleUndoRedo();
    }
    if (e.shiftKey) {
      if (e.key === '+' || e.key === '=' || e.key === 'Add' || e.which === 187) { // (Ctrl/Cmd + Shift + +)
        e.preventDefault();
        core.rotateClockwise();
      } else if (e.key === '-' || e.key === 'Subtract' || e.which === 189) { // (Ctrl/Cmd + Shift + -)
        e.preventDefault();
        core.rotateCounterClockwise();
      }
    } else if (e.key === 'o' || e.which === 79) { // (Ctrl/Cmd + O)
      e.preventDefault();
      openFilePicker();
    } else if (e.key === 'f' || e.which === 70) { // (Ctrl/Cmd + F)
      e.preventDefault();
      const openSearchOverlay = () => {
        dispatch(actions.setSearchOverlayValue(true));
      };
      const shouldPreventEvent = promptUserChangeToolMode({
        callback: openSearchOverlay,
      });
      if (shouldPreventEvent) {
        return;
      }
      openSearchOverlay();
    } else if (e.key === '+' || e.key === '=' || e.key === 'Add' || e.which === 187) { // (Ctrl/Cmd + +)
      e.preventDefault();
      zoomIn();
    } else if (e.key === '-' || e.key === 'Subtract' || e.which === 189) { // (Ctrl/Cmd + -)
      e.preventDefault();
      zoomOut();
    } else if (e.key === '0' || e.which === 48) { // (Ctrl/Cmd + 0)
      e.preventDefault();
      if (window.innerWidth > 640) {
        core.fitToPage();
      } else {
        core.fitToWidth();
      }
    } else if (e.key === 'P' || e.which === 80) { // (Ctrl/Cmd + P)
      e.preventDefault();
      const isPrintDisabled = selectors.isElementDisabled(state, 'printModal');
      if (isPrintDisabled || !currentUser) {
        console.warn('Print has been disabled.');
      } else {
        activePrintButtonByHotKey();
      }
    }
  } else if (e.key === 'PageUp' || e.which === 33) { // (PageUp)
    e.preventDefault();
    if (core.getCurrentPage() > 1) {
      core.setCurrentPage(core.getCurrentPage() - 1);
    }
  } else if (e.key === 'PageDown' || e.which === 34) {
    if (core.getCurrentPage() < core.getTotalPages()) {
      core.setCurrentPage(core.getCurrentPage() + 1);
    }
  } else if (!selectedTextFromCanvas) {
    if (isFocusingElement()) {
      return;
    }
    if (e.which > 64 && e.which < 91) {
      setActiveToolByHotkey({ actualKey: e.key, numericCode: e.which });
    }
  } else if (selectedTextFromCanvas && canAddAnnotation) {
    if (isFocusingElement()) {
      return;
    }
    if (e.key === 'g' || e.which === 71) { // (G)
      createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextSquigglyAnnotation);
    } else if (e.key === 'h' || e.which === 72) { // (H)
      createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation);
    } else if (e.key === 'k' || e.which === 75) { // (K)
      createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextStrikeoutAnnotation);
    } else if (e.key === 'u' || e.which === 85) { // (U)
      createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextUnderlineAnnotation);
    } else if (e.key === 'n' || e.which === 78) { // (U)
      createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation, true);
    }
  }
};
