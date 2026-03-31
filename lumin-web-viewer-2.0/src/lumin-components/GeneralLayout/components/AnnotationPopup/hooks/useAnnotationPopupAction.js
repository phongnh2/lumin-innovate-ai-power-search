import { clamp } from 'lodash';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import getAnnotationStyles from 'helpers/getAnnotationStyles';
import getGroupedLinkAnnotations from 'helpers/getGroupedLinkAnnotations';
import resizeFreetextToFitContent from 'helpers/resizeFreetextToFitContent';
import setCurrentPage from 'helpers/setCurrentPage';

import { lazyWithRetry } from 'utils/lazyWithRetry';
import { updateUserMetadataFromFLPSearchParams } from 'utils/updateUserMetadata';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import useApplyRedaction from 'features/Redact/hooks/useApplyRedaction';

import { MAX_FONT_SIZE, MIN_FONT_SIZE } from 'constants/contentEditTool';
import { CUSTOM_DATA_REORDER_ANNOTATION } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { ANNOTATION_ACTION, ANNOTATION_CHANGE_SOURCE, ANNOTATION_STYLE } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';
import TOOLS_NAME from 'constants/toolsName';

import { AnnotationPopupContext } from '../AnnotationPopupContext';

const WarningHyperlinkContent = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/WarningHyperlinkContent')
);
const useAnnotationPopupAction = () => {
  const dispatch = useDispatch();
  const { setUrl, setPageDest, url, pageDest, annotation, toggleDatePicker } = useContext(AnnotationPopupContext);
  const handleApplyRedaction = useApplyRedaction();
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const annotFontSize = getAnnotationStyles(annotation).FontSize;
  const { t } = useTranslation();

  const updateFontSize = ({ isDecrease }) => {
    const currentAnnotFontSize = parseInt(annotFontSize.split('pt')[0]);
    const updatedFontSize = `${clamp(
      isDecrease ? currentAnnotFontSize - 1 : currentAnnotFontSize + 1,
      MIN_FONT_SIZE,
      MAX_FONT_SIZE
    )}pt`;
    core.setAnnotationStyles(annotation, {
      [ANNOTATION_STYLE.FONT_SIZE]: updatedFontSize,
    });
    core.getAnnotationManager().redrawAnnotation(annotation);
    resizeFreetextToFitContent(annotation);
    core.getTool(TOOLS_NAME.FREETEXT).setStyles({
      [ANNOTATION_STYLE.FONT_SIZE]: updatedFontSize,
    });
  };

  const bringToBackOrFront = ({ isBringToBack }) => {
    if (annotation) {
      const annotManager = core.getAnnotationManager();

      if (isBringToBack) {
        annotManager.bringToBack(annotation);
      } else {
        annotManager.bringToFront(annotation);
      }

      annotManager.redrawAnnotation(annotation);

      annotation.IsModified = true;
      annotation.setCustomData(
        CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key,
        isBringToBack
          ? CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.back
          : CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.front
      );

      annotManager.trigger('annotationChanged', [
        [annotation],
        ANNOTATION_ACTION.MODIFY,
        { source: ANNOTATION_CHANGE_SOURCE.REORDER_APPLIED },
      ]);
    }
  };

  const addComment = () => {
    dispatch(actions.setNoteEditingAnnotationId(annotation.Id));
    dispatch(actions.closeElement('annotationPopup'));
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MEASURE) {
      dispatch(actions.openElement(DataElements.COMMENT_POPUP));
      return;
    }

    if (!isRightPanelOpen) {
      dispatch(actions.setIsRightPanelOpen(true));
    }
    if (rightPanelValue !== LayoutElements.NOTE_HISTORY) {
      dispatch(actions.setRightPanelValue(LayoutElements.NOTE_HISTORY));
    }
  };

  const editText = async () => {
    core.getAnnotationManager().trigger('annotationDoubleClicked', annotation);
    dispatch(actions.closeElement('annotationPopup'));
  };

  const applyRedaction = async () => {
    const annots = core.getSelectedAnnotations().filter((annot) => core.isAnnotationRedactable(annot));
    await handleApplyRedaction(annots);
    dispatch(actions.closeElement('annotationPopup'));
    const isUpdatedUserMetadata = await updateUserMetadataFromFLPSearchParams(
      PdfAction.REDACT_PDF,
      ExploredFeatureKeys.REDACT_PDF
    );
    if (isUpdatedUserMetadata) {
      core.setToolMode(defaultTool);
    }
  };

  const handleAssociatedLink = () => {
    const annotManager = core.getAnnotationManager();
    const selectedAnnotations = core.getSelectedAnnotations();

    selectedAnnotations.forEach((annot) => {
      const linkAnnotations = getGroupedLinkAnnotations(annot);
      linkAnnotations.forEach((linkAnnot, index) => {
        annotManager.ungroupAnnotations([linkAnnot]);
        const isValid =
          // eslint-disable-next-line no-magic-numbers
          annot instanceof window.Core.Annotations.TextHighlightAnnotation && annot.Opacity === 0 && index === 0;

        if (isValid) {
          annotManager.deleteAnnotations([annot, linkAnnot]);
        } else {
          annotManager.deleteAnnotation(linkAnnot);
        }
      });
    });
    setUrl('');
    setPageDest(null);
  };

  const clickHyperLink = () => {
    if (url) {
      const urlObject = new URL(url);
      const domain = urlObject.hostname.replace('www.', '');
      const subDomain = urlObject.hostname.split('.');
      if (domain !== 'luminpdf.com' && `${subDomain[1]}.${subDomain[2]}` !== 'luminpdf.com') {
        dispatch(
          actions.openViewerModal({
            type: ModalTypes.WARNING,
            title: t('viewer.annotationPopup.leavingLumin'),
            message: <WarningHyperlinkContent url={urlObject.href} />,
            cancelButtonTitle: t('common.cancel'),
            confirmButtonTitle: t('common.proceed'),
            onCancel: () => dispatch(actions.closeModal()),
            onConfirm: () => {
              window.open(urlObject.href, '_blank', 'noopener,noreferrer');
            },
            isFullWidthButton: true,
          })
        );
      } else {
        window.open(urlObject.href, '_blank', 'noopener,noreferrer');
      }
    }
    if (pageDest && pageDest.page) {
      setCurrentPage(pageDest.page);
    }
  };

  return {
    bringToBackOrFront,
    addComment,
    editText,
    applyRedaction,
    handleAssociatedLink,
    clickHyperLink,
    toggleDatePicker,
    updateFontSize,
  };
};

export default useAnnotationPopupAction;
