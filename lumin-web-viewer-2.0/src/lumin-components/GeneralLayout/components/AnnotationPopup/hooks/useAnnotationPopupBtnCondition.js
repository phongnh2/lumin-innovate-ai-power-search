import { useContext } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import useToolChecker from '@new-ui/hooks/useToolChecker';

import core from 'core';
import selectors from 'selectors';

import getAnnotationStyles from 'helpers/getAnnotationStyles';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { MOVABLE_ANNOTATION } from 'constants/documentConstants';
import toolsName, { TOOLS_NAME } from 'constants/toolsName';

import { AnnotationPopupContext } from '../AnnotationPopupContext';

const toolsThatCantHaveLinks = [toolsName.CROP_PAGE, toolsName.REDACTION];

const useAnnotationPopupBtnCondition = () => {
  const { annotation, canModify, hasAssociatedLink } = useContext(AnnotationPopupContext);
  const isAnnotationStylePopupDisabled = useSelector(
    (state) => selectors.isElementDisabled(state, 'annotationStylePopup'),
    shallowEqual
  );
  const { isToolAvailable: isCommentToolAvailable } = useToolChecker(TOOLS_NAME.STICKY);

  const selectedAnnotations = core.getSelectedAnnotations();
  const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();

  const numberOfSelectedAnnotations = selectedAnnotations.length;
  const numberOfGroups = core.getNumberOfGroups(selectedAnnotations);
  const canUngroup = numberOfGroups === 1 && numberOfSelectedAnnotations > 1;
  const redactionEnabled = core.isAnnotationRedactable(annotation);
  const multipleAnnotationsSelected = numberOfSelectedAnnotations > 1;

  const style = getAnnotationStyles(annotation);
  const hasStyle = Object.keys(style).length > 0;
  const isContentEditPlaceholder = annotation.isContentEditPlaceholder();

  const isMoveableAnnotation = Boolean(MOVABLE_ANNOTATION.includes(annotation?.Subject));
  const isLinkAnnotation = annotation instanceof window.Core.Annotations.Link;

  const showCommentButton =
    canModify &&
    !redactionEnabled &&
    (!multipleAnnotationsSelected || canUngroup) &&
    annotation.ToolName !== 'CropPage' &&
    !isInFormFieldCreationMode &&
    !annotation.isContentEditPlaceholder() &&
    !isLinkAnnotation &&
    isCommentToolAvailable;

  const showEditStyleButton =
    canModify &&
    hasStyle &&
    !isAnnotationStylePopupDisabled &&
    (!multipleAnnotationsSelected || canUngroup) &&
    annotation.ToolName !== 'CropPage' &&
    !isInFormFieldCreationMode &&
    !annotation.isContentEditPlaceholder() &&
    !isLinkAnnotation;

  const showLinkButton =
    !toolsThatCantHaveLinks.includes(annotation.ToolName) &&
    !isInFormFieldCreationMode &&
    !annotation.isContentEditPlaceholder() &&
    !isLinkAnnotation;

  const showNavigateButton =
    hasAssociatedLink && (!multipleAnnotationsSelected || canUngroup) && !annotation.isContentEditPlaceholder();

  const showEditTextButton =
    isContentEditPlaceholder && annotation.getContentEditType() === window.Core.ContentEdit.Types.TEXT;

  const showCalendarButton =
    canModify &&
    !multipleAnnotationsSelected &&
    annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
    Boolean(annotation.getDateFormat());

  const isSignatureWidget = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
  const showReorderButton =
    canModify &&
    (!multipleAnnotationsSelected || canUngroup) &&
    !isInFormFieldCreationMode &&
    !isContentEditPlaceholder &&
    isMoveableAnnotation &&
    !isSignatureWidget;

  const showRedactButton = redactionEnabled;

  const showAddOutlineButton = !isInFormFieldCreationMode && !annotation.isContentEditPlaceholder();

  const showChangeFormFieldButton = !multipleAnnotationsSelected &&
    isInFormFieldCreationMode &&
    annotation instanceof window.Core.Annotations.WidgetAnnotation &&
    annotation.ToolName !== TOOLS_NAME.RADIO;

  return {
    showCommentButton,
    showLinkButton,
    showNavigateButton,
    showEditTextButton,
    showCalendarButton,
    showReorderButton,
    showEditStyleButton,
    showRedactButton,
    showAddOutlineButton,
    showChangeFormFieldButton
  };
};

export default useAnnotationPopupBtnCondition;
