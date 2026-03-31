/* eslint-disable sonarjs/cognitive-complexity */
import { ClickAwayListener } from '@mui/material';
import { isArray } from 'lodash';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import rafSchd from 'raf-schd';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, connect } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isComment, isHighlightComment, isCommentByHighLight } from 'lumin-components/CommentPanel/helper';
import DraggablePopup from 'lumin-components/GeneralLayout/general-components/DraggablePopup';

import { usePrevious } from 'hooks/usePrevious';
import { useWindowSize } from 'hooks/useWindowSize';

import getAnnotationStyles from 'helpers/getAnnotationStyles';
import getGroupedLinkAnnotations from 'helpers/getGroupedLinkAnnotations';
import { getAnnotationPopupPositionBasedOn } from 'helpers/getPopupPosition';

import { AnnotationCategorize } from 'utils/annotationCategorize';

import CalibrationPopup from 'features/MeasureTool/components/CalibrationPopup';
import { isMeasurementCalibration } from 'features/MeasureTool/utils';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import { AnnotationSubjectMapping, PDF_ACTION_TYPE } from 'constants/documentConstants';
import { HTTPS_PROTOCOL, HTTP_PROTOCOL } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import { AnnotationPopupContext } from './AnnotationPopupContext';
import AnnotationStylePalette from './components/AnnotationStylePalette';
import PopupMainContent from './components/PopupMainContent';
import { getPosition } from './utils';
import DatePicker from '../DatePicker/DatePicker';
import { isCropAnnotation } from '../ToolProperties/components/CropPanel/helpers/isCropAnnotation';

import * as Styled from './AnnotationPopup.styled';

const DEBOUNCE_SINGLE_CLICK_ANNOT_TIME = 150;

const AnnotationPopup = ({ isDisabled, isOpen, isLeftPanelOpen, isRightPanelOpen, popupItems }) => {
  const prevIsLeftPanelOpen = usePrevious(isLeftPanelOpen);
  const windowSize = useWindowSize();

  const dispatch = useDispatch();
  const [position, setPosition] = useState({ left: 0, top: 0 });
  // first annotation in the array when there're multiple annotations selected
  const [canModify, setCanModify] = useState(false);
  const [firstAnnotation, setFirstAnnotation] = useState(null);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isStylePopupOpen, setIsStylePopupOpen] = useState(false);
  const [hasAssociatedLink, setHasAssociatedLink] = useState(true);
  const [isDatePickerMount, setDatePickerMount] = useState(false);
  const [pageDest, setPageDest] = useState();
  const [url, setUrl] = useState('');
  const isEditingContentBoxRef = useRef();
  const toggleDatePicker = () => setDatePickerOpen((isDatePickOpen) => !isDatePickOpen);
  const debounceSetFirstAnnotation = useCallback(
    debounce((annot) => setFirstAnnotation(annot), DEBOUNCE_SINGLE_CLICK_ANNOT_TIME),
    []
  );

  const popupRef = useRef();

  useEffect(() => {
    const onStarted = () => {
      isEditingContentBoxRef.current = true;
    };

    const onEnded = () => {
      isEditingContentBoxRef.current = false;
    };

    core.addEventListener('contentBoxEditStarted', onStarted);
    core.addEventListener('contentBoxEditEnded', onEnded);

    return () => {
      core.removeEventListener('contentBoxEditStarted', onStarted);
      core.removeEventListener('contentBoxEditEnded', onEnded);
    };
  }, []);

  const getMouseUpAction = (annotation) => annotation.getActions()[PDF_ACTION_TYPE.MOUSE_RELEASED];

  useEffect(() => {
    if (firstAnnotation) {
      const isLinkAnnotation = firstAnnotation instanceof window.Core.Annotations.Link;
      const groupedLinkAnnotations = getGroupedLinkAnnotations(firstAnnotation);
      const hasLinkAnnotations = groupedLinkAnnotations.length > 0 || isLinkAnnotation;

      setHasAssociatedLink(hasLinkAnnotations);

      if (hasLinkAnnotations) {
        const targetLinkAnnotation = groupedLinkAnnotations.length > 0 ? groupedLinkAnnotations[0] : firstAnnotation;
        const mouseUpAction = getMouseUpAction(targetLinkAnnotation);
        const urlFromAnnotation = isArray(mouseUpAction) ? mouseUpAction[0].uri || '' : '';
        if (urlFromAnnotation) {
          setPageDest(null);
          if (urlFromAnnotation.startsWith(HTTP_PROTOCOL) || urlFromAnnotation.startsWith(HTTPS_PROTOCOL)) {
            setUrl(urlFromAnnotation);
          } else {
            setUrl(`${HTTPS_PROTOCOL}${urlFromAnnotation}`);
          }
        } else {
          const pageDestAnnotation = mouseUpAction?.[0].dest;
          if (pageDestAnnotation) {
            setPageDest(pageDestAnnotation);
          }
        }
      }
    }
  }, [firstAnnotation, hasAssociatedLink]);

  const closeAndReset = useCallback(() => {
    setFirstAnnotation(null);
    dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
    setPosition({ left: 0, top: 0 });
    setIsStylePopupOpen(false);
    setCanModify(false);
    setUrl('');
    setDatePickerOpen(false);
    setPageDest(null);
  }, [dispatch]);

  const handleClosePopup = (e) => {
    const annotUnderMouse = core.getAnnotationByMouseEvent(e);
    const isRedaction = core.isAnnotationRedactable(firstAnnotation);
    if (!annotUnderMouse && !isRedaction) {
      dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
    }
  };

  const handlePreventBubblingEvent = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isLeftPanelOpen !== prevIsLeftPanelOpen) {
      closeAndReset();
    }

    const onDeselectRedactionAnnotations = (annotations) => {
      if (isStylePopupOpen) {
        core.selectAnnotations(annotations);
        setIsStylePopupOpen(false);
      } else {
        dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
      }
    };

    const onAnnotationSelected = (annotations, action) => {
      if (annotations?.length && annotations[0].isReply()) {
        return;
      }
      if (action === 'selected' && annotations.length) {
        const isSelectedAGroupOfLinkAnnot =
          annotations.length > 1 && annotations.filter(AnnotationCategorize.isHighlightAnnotation).length === 1;
        const selectedIndex = isSelectedAGroupOfLinkAnnot
          ? annotations.findIndex(AnnotationCategorize.isHighlightAnnotation)
          : 0;

        if (annotations.some(AnnotationCategorize.isHighlightAnnotation)) {
          const annoList = core.getAnnotationManager().getAnnotationsList();

          const commentsNeedToBeFocused = [];
          annotations.forEach((annotation) => {
            const isValidHightlight =
              annotation.Subject === AnnotationSubjectMapping.highlight &&
              annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key);

            if (isValidHightlight) {
              const commentFocus = annoList.find(
                (e) => e.Id === annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key)
              );
              if (commentFocus) {
                commentsNeedToBeFocused.push(commentFocus);
              }
            }
          });
          if (commentsNeedToBeFocused.length) {
            core.selectAnnotations(commentsNeedToBeFocused);
          }
        }

        setCanModify(core.canModify(annotations[selectedIndex]));
        debounceSetFirstAnnotation(annotations[selectedIndex]);
      } else if (AnnotationCategorize.isRedactionAnnotationDeselected({ annotations, action })) {
        onDeselectRedactionAnnotations(annotations);
      } else if (!AnnotationCategorize.isLinkAnnotationDeselected({ annotations, action })) {
        closeAndReset();
      }
    };

    core.addEventListener('documentUnloaded', closeAndReset);
    core.addEventListener('annotationSelected', onAnnotationSelected);

    window.addEventListener('resize', closeAndReset);
    return () => {
      core.removeEventListener('documentUnloaded', closeAndReset);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
      window.removeEventListener('resize', closeAndReset);
    };
  }, [dispatch, isLeftPanelOpen, isRightPanelOpen, isStylePopupOpen, isOpen]);

  useEffect(() => {
    // calling this function will always rerender this component
    // because the position state always has a new object reference
    const setPopupPositionAndShow = () => {
      if (firstAnnotation && isCropAnnotation(firstAnnotation)) {
        return;
      }
      if (popupRef.current && popupItems.length > 0) {
        const { left, top } = getAnnotationPopupPositionBasedOn(firstAnnotation, popupRef);
        if (isStylePopupOpen) {
          if (firstAnnotation.Subject === AnnotationSubjectMapping.freetext) {
            const [newLeft, newTop] = getPosition({ left, top, annotation: firstAnnotation, windowSize });
            setPosition({ left: newLeft, top: newTop });
            return;
          }
          // eslint-disable-next-line no-magic-numbers
          if (left > 1080) {
            setPosition({ left: 1080, top });
            return;
          }
        }
        setPosition({ left, top });
        setTimeout(() => {
          const isCommentByHighLight =
            isComment(firstAnnotation) &&
            firstAnnotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key);
          const isCommentAnnoHighLight = isHighlightComment(firstAnnotation);
          const isMultipleAnnotationsSelected = core.getSelectedAnnotations().length > 1;
          const isFreeTextOrParagraphAnnotation =
            firstAnnotation.Subject === AnnotationSubjectMapping.freetext &&
            [TOOLS_NAME.FREETEXT, TOOLS_NAME.ADD_PARAGRAPH].includes(firstAnnotation.ToolName);

          const shouldCloseAnnotationPopup = firstAnnotation?.editor?.shouldCloseAnnotationPopup;

          const requireOpenAnnotationPopup = () => {
            const isFocusingFreeText =
              !shouldCloseAnnotationPopup &&
              isFreeTextOrParagraphAnnotation &&
              firstAnnotation.getEditor()?.hasFocus() &&
              firstAnnotation.ToolName !== TOOLS_NAME.ADD_PARAGRAPH;

            return isFreeTextOrParagraphAnnotation
              ? isFocusingFreeText || isMultipleAnnotationsSelected
              : !isCommentAnnoHighLight && !isCommentByHighLight && !isEditingContentBoxRef.current;
          };

          if (requireOpenAnnotationPopup()) {
            dispatch(actions.openElement(DataElements.ANNOTATION_POPUP));
          }
        }, 0);
      }
    };
    const isSelectWidgetInFormBuilder =
      firstAnnotation?.Subject === AnnotationSubjectMapping.widget &&
      core.getFormFieldCreationManager().isInFormFieldCreationMode();
    if (
      (firstAnnotation &&
        firstAnnotation.Subject !== AnnotationSubjectMapping.stickyNote &&
        firstAnnotation.Subject !== AnnotationSubjectMapping.widget) ||
      isSelectWidgetInFormBuilder ||
      isStylePopupOpen ||
      isDatePickerMount
    ) {
      setPopupPositionAndShow();
    }

    const onMouseLeftUp = (e) => {
      // clicking on the selected annotation is considered clicking outside of this component
      // so this component will close due to useOnClickOutside
      // this handler is used to make sure that if we click on the selected annotation, this component will show up again
      const annotUnderMouse = core.getAnnotationByMouseEvent(e);
      if (annotUnderMouse instanceof window.Core.Annotations.FreeTextAnnotation) {
        dispatch(actions.openElement(DataElements.ANNOTATION_POPUP));
      }
      const isSelectWidgetInFormBuilder =
        firstAnnotation?.Subject === AnnotationSubjectMapping.widget &&
        core.getFormFieldCreationManager().isInFormFieldCreationMode();
      if (
        firstAnnotation &&
        annotUnderMouse === firstAnnotation &&
        (firstAnnotation.Subject !== AnnotationSubjectMapping.widget || isSelectWidgetInFormBuilder) &&
        firstAnnotation.Subject !== AnnotationSubjectMapping.stickyNote
      ) {
        setPopupPositionAndShow();
      }
    };

    const onAnnotationChanged = (annotations, action) => {
      const isValidForDelete = annotations.some((annot) => annot.Id === firstAnnotation?.Id);

      if (action === 'delete' && isValidForDelete) {
        dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
        setFirstAnnotation(null);
      }

      if (action === 'modify' && annotations.length > 0) {
        setPopupPositionAndShow();
      }

      const hasLinkAnnotation = annotations.some((annotation) => annotation instanceof window.Core.Annotations.Link);
      if (!hasLinkAnnotation) {
        return;
      }
      if (action === 'add') {
        setHasAssociatedLink(true);
      }
      if (action === 'delete') {
        setHasAssociatedLink(false);
      }
    };

    const onUpdateAnnotationPermission = () => {
      if (firstAnnotation) {
        setCanModify(core.canModify(firstAnnotation));
      }
    };

    const onAnnotationDoubleClicked = (annotation) => {
      if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
        /* LMV-3505 Temporary prevent user edit date stamp */
        if (annotation.getDateFormat()) {
          debounceSetFirstAnnotation.cancel();
          toggleDatePicker();
          setFirstAnnotation(annotation);
        } else {
          dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
        }
      }
    };

    const onEditorTextChanged = rafSchd(() => {
      const annot = core.getSelectedAnnotations()[0];
      if (!annot || !(annot instanceof window.Core.Annotations.FreeTextAnnotation)) {
        return;
      }

      if (annot === firstAnnotation) {
        annot.editor.shouldCloseAnnotationPopup = true;
        dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
      }
    });

    const onMouseLeftDown = (e) => {
      const annotUnderMouse = core.getAnnotationByMouseEvent(e);
      if (!(annotUnderMouse instanceof window.Core.Annotations.FreeTextAnnotation)) {
        return;
      }

      dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
    };

    core.addEventListener('mouseLeftUp', onMouseLeftUp);
    core.addEventListener('mouseLeftDown', onMouseLeftDown);
    core.addEventListener('annotationDoubleClicked', onAnnotationDoubleClicked);

    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
    core.addEventListener('editorTextChanged', onEditorTextChanged);
    return () => {
      core.removeEventListener('mouseLeftUp', onMouseLeftUp);
      core.removeEventListener('mouseLeftDown', onMouseLeftDown);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      core.removeEventListener('annotationDoubleClicked', onAnnotationDoubleClicked);

      core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
      core.removeEventListener('editorTextChanged', onEditorTextChanged);
    };
  }, [dispatch, canModify, firstAnnotation, isStylePopupOpen, popupItems, isDatePickerMount]);

  useEffect(() => {
    const onShouldDeselectFreeText = (editor, annotation) => {
      editor.shouldDeselect = !isOpen && !annotation.getDateFormat();
    };
    core.addEventListener('editorBlur', onShouldDeselectFreeText);

    return () => {
      core.removeEventListener('editorBlur', onShouldDeselectFreeText);
    };
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({
      setUrl,
      setPageDest,
      url,
      pageDest,
      toggleDatePicker,
      setIsStylePopupOpen,
      annotation: firstAnnotation,
      canModify,
      hasAssociatedLink,
      isDisabled,
    }),
    [url, pageDest, firstAnnotation, canModify, hasAssociatedLink, isDisabled]
  );

  if (!firstAnnotation) {
    return null;
  }
  const style = getAnnotationStyles(firstAnnotation);

  const isCommentAnnotation = isComment(firstAnnotation);

  const isCommentHighlightAnnotation = isCommentByHighLight(firstAnnotation);

  const handleDateChange = (text) => {
    core.getAnnotationManager().setNoteContents(firstAnnotation, text);
    core.getAnnotationManager().updateAnnotation(firstAnnotation);
  };

  const onDatePickerShow = (isDatePickerShowed) => {
    setDatePickerMount(isDatePickerShowed);
  };

  const contentPopup = () => {
    if (isDatePickerOpen) {
      return <DatePicker onClick={handleDateChange} annotation={firstAnnotation} onDatePickerShow={onDatePickerShow} />;
    }
    if (isStylePopupOpen) {
      return <AnnotationStylePalette annotation={firstAnnotation} style={style} />;
    }
    if (isMeasurementCalibration(firstAnnotation)) {
      return <CalibrationPopup annotation={firstAnnotation} />;
    }
    return !isCommentAnnotation && !isCommentHighlightAnnotation && <PopupMainContent />;
  };

  if ((isDisabled || !canModify) && !hasAssociatedLink) {
    return null;
  }

  const dragPosition = () => {
    if (isMeasurementCalibration(firstAnnotation)) {
      return null;
    }

    if (isStylePopupOpen || isDatePickerOpen) {
      return 'top';
    }
    return 'left';
  };

  const hasPosition = position.left !== 0 || position.top !== 0;

  return (
    <ClickAwayListener onClickAway={handleClosePopup}>
      <DraggablePopup
        handle=".annotation-popup-drag-handle"
        cancel=".MuiSlider-root, .MuiButtonBase-root, .MuiInputBase-root"
        position={position}
        dataElement="annotationPopup"
        open={isOpen && !isCommentAnnotation && hasPosition}
        ref={popupRef}
        wrapperProps={{ className: 'annotation-popup-drag-handle' }}
        allowDrag={dragPosition()}
      >
        <AnnotationPopupContext.Provider value={contextValue}>
          <Styled.AnnotationPopupContent onClick={handlePreventBubblingEvent} data-cy="annotation_popup_content">
            {contentPopup()}
          </Styled.AnnotationPopupContent>
        </AnnotationPopupContext.Provider>
      </DraggablePopup>
    </ClickAwayListener>
  );
};

AnnotationPopup.propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  isLeftPanelOpen: PropTypes.bool.isRequired,
  isRightPanelOpen: PropTypes.bool,
  popupItems: PropTypes.array.isRequired,
};

AnnotationPopup.defaultProps = {
  isRightPanelOpen: false,
  isDisabled: false,
  isOpen: false,
};

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'annotationPopup'),
  isOpen: selectors.isElementOpen(state, 'annotationPopup'),
  isLeftPanelOpen: selectors.isElementOpen(state, 'leftPanel'),
  isRightPanelOpen: selectors.isElementOpen(state, 'searchPanel'),
  popupItems: selectors.getPopupItems(state, 'annotationPopup'),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationPopup);
