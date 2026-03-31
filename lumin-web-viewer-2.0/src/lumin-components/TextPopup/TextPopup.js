/* eslint-disable sonarjs/cognitive-complexity */
import classNames from 'classnames';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import CustomizablePopup from 'luminComponents/CustomizablePopup';

import { useTranslation } from 'hooks';
import useOnClickOutside from 'hooks/useOnClickOutside';

import copyText from 'helpers/copyText';
import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';
import getCurrentRole from 'helpers/getCurrentRole';
import { getTextPopupPositionBasedOn } from 'helpers/getPopupPosition';
import getToolPopper from 'helpers/getToolPopper';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import { DataElements } from 'constants/dataElement';
import { general } from 'constants/documentType';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import ToolsName from 'constants/toolsName';

import './TextPopup.scss';

const ActionButton = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ViewerCommon/ActionButton')
);

const TextPopup = () => {
  const isDisabled = useSelector((state) => selectors.isElementDisabled(state, 'textPopup'));
  const isOpen = useSelector((state) => selectors.isElementOpen(state, 'textPopup'));
  const popupItems = useSelector((state) => selectors.getPopupItems(state, 'textPopup'), shallowEqual);
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isDisabledLink = useSelector((state) => selectors.isElementDisabled(state, DataElements.LINK_BUTTON));
  const userRole = getCurrentRole(currentDocument);
  const { t } = useTranslation();

  const canUseRedact = featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.REDACTION, currentDocument.service);
  const isPdfDocument = currentDocument.mimeType === general.PDF;

  const [
    isDisabledHighlight,
    isDisabledUnderline,
    isDisabledSquiggly,
    isDisabledStrikeout,
    isDisabledSticky,
    isDisabledRedaction,
  ] = [
    ToolsName.HIGHLIGHT,
    ToolsName.UNDERLINE,
    ToolsName.SQUIGGLY,
    ToolsName.STRIKEOUT,
    ToolsName.STICKY,
    ToolsName.REDACTION,
  ].map((tool) => !!getToolPopper({ currentDocument, currentUser, toolName: tool, translator: t }).title);

  const dispatch = useDispatch();
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const popupRef = useRef();

  useOnClickOutside(popupRef, () => {
    dispatch(actions.closeElement('textPopup'));
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(actions.closeElements(['annotationPopup', 'contextMenuPopup']));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    const textSelectTool = core.getTool('TextSelect');
    const onSelectionComplete = (startQuad, allQuads) => {
      if (popupRef.current && popupItems.length > 0) {
        setPosition(getTextPopupPositionBasedOn(allQuads, popupRef));
        dispatch(actions.openElement('textPopup'));
      }
    };

    textSelectTool.addEventListener('selectionComplete', onSelectionComplete);
    return () => textSelectTool.removeEventListener('selectionComplete', onSelectionComplete);
  }, [dispatch, popupItems]);

  const closeRightPanel = () => {
    dispatch(actions.closeElement('rightPanel'));
  };

  return isDisabled || isPreviewOriginalVersionMode || isPageEditMode ? null : (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames({
        Popup: true,
        TextPopup: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="textPopup"
      ref={popupRef}
      style={{ ...position }}
      onClick={() => {
        dispatch(actions.closeElement('textPopup'));
      }}
    >
      <CustomizablePopup dataElement="textPopup">
        {!isPageEditMode && !isDisabledSticky && (
          <ActionButton
            dataElement={DataElements.STICKY_TOOL_BUTTON}
            title="annotation.stickyNote"
            icon="add-comment"
            onClick={() => {
              createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation, true);
              closeRightPanel();
            }}
          />
        )}
        <ActionButton dataElement={DataElements.COPY_TEXT_BUTTON} title="action.copy" icon="copy" onClick={copyText} />
        {!isDisabledHighlight && (
          <ActionButton
            dataElement={DataElements.TEXT_HIGHLIGHT_TOOL_BUTTON}
            title="annotation.highlight"
            icon="tool-highlight"
            onClick={() => {
              createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation);
            }}
          />
        )}
        {!isDisabledRedaction && canUseRedact && isPdfDocument && (
          <ActionButton
            dataElement={DataElements.TEXT_REDACT_TOOL_BUTTON}
            title="option.redaction.markForRedaction"
            icon="tool-redaction"
            data-lumin-btn-name={ButtonName.REDACTION_BY_TEXT}
            onClick={() => createTextAnnotationAndSelect(dispatch, window.Core.Annotations.RedactionAnnotation)}
          />
        )}
        {!isDisabledUnderline && (
          <ActionButton
            dataElement={DataElements.TEXT_UNDERLINE_TOOL_BUTTON}
            title="annotation.underline"
            icon="underline-tool"
            onClick={() => {
              createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextUnderlineAnnotation);
            }}
          />
        )}
        {!isDisabledSquiggly && (
          <ActionButton
            dataElement={DataElements.TEXT_SQUIGGLY_TOOL_BUTTON}
            title="annotation.squiggly"
            icon="tool-squiggly"
            onClick={() => {
              createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextSquigglyAnnotation);
            }}
          />
        )}
        {!isDisabledStrikeout && (
          <ActionButton
            dataElement={DataElements.TEXT_STRIKEOUT_TOOL_BUTTON}
            title="annotation.strikeout"
            icon="tool-strike"
            onClick={() => {
              createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextStrikeoutAnnotation);
            }}
          />
        )}
        {!isDisabledLink && [DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.EDITOR].includes(userRole) && (
          <ActionButton
            dataElement={DataElements.LINK_BUTTON}
            title="tool.Link"
            icon="link"
            onClick={() => dispatch(actions.openElement(DataElements.LINK_MODAL))}
          />
        )}
      </CustomizablePopup>
    </div>
  );
};

export default TextPopup;
