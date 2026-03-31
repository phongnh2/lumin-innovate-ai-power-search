import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import DraggablePopup from 'lumin-components/GeneralLayout/general-components/DraggablePopup';

import { useLatestRef } from 'hooks';
import useOnClickOutside from 'hooks/useOnClickOutside';

import { getTextPopupPositionBasedOn } from 'helpers/getPopupPosition';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import AddComment from './components/AddComment';
import AddOutline from './components/AddOutline';
import CopyText from './components/CopyText';
import HighlightText from './components/HighlightText';
import LinkBtn from './components/LinkBtn';
import RedactText from './components/RedactText';
import SquigglyText from './components/SquigglyText';
import StrikeoutText from './components/StrikeoutText';
import UnderlineText from './components/UnderlineText';

import * as Styled from './TextPopup.styled';

const TextPopup = () => {
  const isDisabled = useSelector((state) => selectors.isElementDisabled(state, 'textPopup'));
  const isOpen = useSelector((state) => selectors.isElementOpen(state, 'textPopup'));
  const popupItems = useSelector((state) => selectors.getPopupItems(state, 'textPopup'), shallowEqual);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const dispatch = useDispatch();
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const popupRef = useRef();
  const readAloudModeRef = useLatestRef(isInReadAloudMode);

  const onClose = () => {
    dispatch(actions.closeElement('textPopup'));
  };

  useOnClickOutside(popupRef, () => {
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(actions.closeElements(['annotationPopup', 'contextMenuPopup']));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    const textSelectTool = core.getTool('TextSelect');
    const onSelectionComplete = (startQuad, allQuads) => {
      if (popupRef.current && popupItems.length > 0 && !readAloudModeRef.current) {
        setPosition(getTextPopupPositionBasedOn(allQuads, popupRef));
        dispatch(actions.openElement('textPopup'));
      }
    };

    textSelectTool.addEventListener('selectionComplete', onSelectionComplete);
    return () => textSelectTool.removeEventListener('selectionComplete', onSelectionComplete);
  }, [dispatch, popupItems]);

  return isDisabled || isPreviewOriginalVersionMode || isPageEditMode || !isDocumentLoaded ? null : (
    <DraggablePopup
      handle=".annotation-popup-drag-handle"
      cancel=".MuiButtonBase-root"
      position={position}
      dataElement="annotationPopup"
      open={isOpen}
      ref={popupRef}
      wrapperProps={{ className: 'annotation-popup-drag-handle' }}
      allowDrag={null}
      data-element="textPopup"
    >
      <Styled.TextPopupContentWrapper>
        <AddComment />
        <CopyText />
        <HighlightText />
        <RedactText />
        <UnderlineText />
        <SquigglyText />
        <StrikeoutText />
        <LinkBtn />
        <AddOutline closePopup={onClose} />
      </Styled.TextPopupContentWrapper>
    </DraggablePopup>
  );
};

export default TextPopup;
