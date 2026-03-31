import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import useToolChecker from '@new-ui/hooks/useToolChecker';

import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import getAnnotationStyles from 'helpers/getAnnotationStyles';

import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { measureToolSelectors } from 'features/MeasureTool/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

import { useEnabledFreeTextToolbar } from './useEnabledFreeTextToolbar';

interface IActivedAnnotation {
  style: IAnnotationStyle;
  annotation: Core.Annotations.Annotation | null;
}

const EXCEPTED_TOOLBARS = [LEFT_SIDE_BAR.PAGE_TOOLS, LEFT_SIDE_BAR.EDIT_PDF, LEFT_SIDE_BAR.SECURITY];

export const useFreeTextToolbarVisibility = () => {
  const { enabled: isEnabledFreeTextToolbar } = useEnabledFreeTextToolbar();

  const toolbarValue = useSelector(selectors.toolbarValue);
  const activeToolName = useSelector(selectors.getActiveToolName) as string;
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const isInFormBuilderMode = useSelector(formBuilderSelectors.isInFormBuildMode);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const { isToolAvailable: isFreeTextToolAvailable } = useToolChecker(TOOLS_NAME.FREETEXT);

  const activeToolStyles = useShallowSelector(selectors.getActiveToolStyles);

  const isRedactionToolActive = activeToolName === TOOLS_NAME.REDACTION;
  const isMeasurementToolActive = useSelector(measureToolSelectors.isActive);
  const isFreeTextToolActive = activeToolName === TOOLS_NAME.FREETEXT || activeToolName === TOOLS_NAME.DATE_FREE_TEXT;

  const [activedAnnotation, setActivedAnnotation] = useState<IActivedAnnotation>({ style: null, annotation: null });

  const style = useMemo(() => {
    if (activedAnnotation.style) {
      return activedAnnotation.style;
    }
    return activeToolStyles as IAnnotationStyle;
  }, [activedAnnotation.style, activeToolStyles]);

  const isFreeTextToolbarActive =
    !isInReadAloudMode &&
    !isInFormBuilderMode &&
    !isRedactionToolActive &&
    !isMeasurementToolActive &&
    !isPreviewOriginalVersionMode &&
    isFreeTextToolAvailable &&
    isEnabledFreeTextToolbar &&
    !EXCEPTED_TOOLBARS.includes(toolbarValue) &&
    (activedAnnotation.annotation !== null || isFreeTextToolActive);

  const resetStates = () => {
    setActivedAnnotation({ style: null, annotation: null });
  };

  const onMouseLeftUp = (e: MouseEvent) => {
    const selectedAnnotation = core.getSelectedAnnotations()[0];
    const annotUnderMouse = core.getAnnotationByMouseEvent(e);
    const currentAnnotation = annotUnderMouse || selectedAnnotation;
    if (!isPreviewOriginalVersionMode && currentAnnotation instanceof window.Core.Annotations.FreeTextAnnotation) {
      setActivedAnnotation({
        annotation: currentAnnotation,
        style: getAnnotationStyles(currentAnnotation) as IAnnotationStyle,
      });
      return;
    }
    resetStates();
  };

  const onAnnotationChanged = (
    annotations: Core.Annotations.Annotation[],
    action: string,
    { imported }: { imported: boolean }
  ) => {
    const firstAnnotation = annotations[0];
    if (!(firstAnnotation instanceof window.Core.Annotations.FreeTextAnnotation) || imported) {
      return;
    }
    switch (action) {
      case ANNOTATION_ACTION.ADD:
      case ANNOTATION_ACTION.MODIFY:
        setActivedAnnotation({
          annotation: firstAnnotation,
          style: getAnnotationStyles(firstAnnotation) as IAnnotationStyle,
        });
        break;
      case ANNOTATION_ACTION.DELETE:
        resetStates();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (EXCEPTED_TOOLBARS.includes(toolbarValue)) {
      resetStates();
    }
  }, [toolbarValue]);

  useEffect(() => {
    resetStates();
  }, [activeToolName, isInContentEditMode, isInFormBuilderMode, isInReadAloudMode, isPreviewOriginalVersionMode]);

  useEffect(() => {
    core.addEventListener('mouseLeftUp', onMouseLeftUp);
    core.addEventListener('annotationChanged', onAnnotationChanged);
    return () => {
      core.removeEventListener('mouseLeftUp', onMouseLeftUp);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [isPreviewOriginalVersionMode]);

  return {
    style,
    annotation: activedAnnotation.annotation,
    isFreeTextToolbarActive,
  };
};
