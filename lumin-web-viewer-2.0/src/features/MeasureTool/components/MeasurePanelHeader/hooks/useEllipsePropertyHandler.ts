import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import core from 'core';

import { measureToolSelectors } from 'features/MeasureTool/slices';
import { getFormattedUnit } from 'features/MeasureTool/utils/getFormattedUnit';
import { getNumberOfDecimalPlaces } from 'features/MeasureTool/utils/getNumberOfDecimalPlaces';

import { TOOLS_NAME } from 'constants/toolsName';

const computeRadius = (annotation: Core.Annotations.EllipseAnnotation) => {
  if (!annotation) {
    return 0;
  }
  const decimalPlaces = (annotation && getNumberOfDecimalPlaces(annotation.Precision)) || 0;
  const { factor } = annotation.Measure.axis[0];
  const radiusInPts = Number((annotation.Width / 2).toFixed(decimalPlaces));
  return Number((radiusInPts * factor).toFixed(decimalPlaces));
};

export const useEllipsePropertyHandler = (annotation: Core.Annotations.EllipseAnnotation) => {
  const [radius, setRadius] = useState(computeRadius(annotation));
  const selectedScale = useSelector(measureToolSelectors.getSelectedScale);

  const forceEllipseRedraw = (_annotation: Core.Annotations.EllipseAnnotation) => {
    const annotationManager = core.getAnnotationManager();
    annotationManager.redrawAnnotation(annotation);
    annotationManager.trigger('annotationChanged', [[annotation], 'modify', []]);
  };

  const getMaxDiameterInPts = (_annotation: Core.Annotations.EllipseAnnotation) => {
    const currentPageNumber = core.getCurrentPage();
    const documentWidth = core.getPageWidth(currentPageNumber);
    const documentHeight = core.getPageHeight(currentPageNumber);
    const startX = _annotation.X;
    const startY = _annotation.Y;

    const maxX = documentWidth - startX;
    const maxY = documentHeight - startY;

    return Math.min(maxX, maxY);
  };

  const refreshRadius = () => {
    setRadius(computeRadius(annotation));
  };

  const finishAnnotation = () => {
    const tool = core.getTool(TOOLS_NAME.ELLIPSE_MEASUREMENT as ToolName);
    tool.finish();
  };

  const handleApplyRadiusLength = () => {
    const { factor } = annotation.Measure.axis[0];
    const radiusInPts = radius / factor;
    const diameterInPts = radiusInPts * 2;
    const { x1, y1, x2, y2 } = annotation.getRect();
    const maxDiameterInPts = getMaxDiameterInPts(annotation);
    const currentPageNumber = core.getCurrentPage();
    const documentWidth = core.getPageWidth(currentPageNumber);
    const documentHeight = core.getPageHeight(currentPageNumber);

    const initialHeight = diameterInPts;
    const initialWidth = diameterInPts;
    const proposedX2 = x1 + diameterInPts;
    const proposedY2 = y1 + diameterInPts;

    const isExceedingMaxDiameter = diameterInPts > maxDiameterInPts;
    const isExceedingWidth = x2 > documentWidth;
    const isExceedingHeight = y2 > documentHeight;

    const adjustedX2 = isExceedingMaxDiameter && isExceedingWidth ? documentWidth : proposedX2;
    const adjustedY2 = isExceedingMaxDiameter && isExceedingHeight ? documentHeight : proposedY2;
    const adjustedWidth = isExceedingMaxDiameter ? Math.min(adjustedX2 - x1, documentWidth) : initialWidth;
    const adjustedHeight = isExceedingMaxDiameter ? Math.min(adjustedY2 - y1, documentHeight) : initialHeight;

    annotation.setHeight(adjustedHeight);
    annotation.setWidth(adjustedWidth);
    annotation.resize(new Core.Math.Rect(x1, y1, adjustedX2, adjustedY2));
    forceEllipseRedraw(annotation);
    refreshRadius();
    finishAnnotation();
  };

  const handleEnterKeyPressOnRadiusInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleApplyRadiusLength();
      event.currentTarget.blur();
    }
  };

  const onChangeRadiusLength = (value: number) => {
    const radiusValue = Math.max(value, 0.0001);
    setRadius(radiusValue);
  };

  useEffect(() => {
    if (!annotation) {
      setRadius(0);
      return undefined;
    }

    setRadius(computeRadius(annotation));
    const onAnnotationChanged = () => {
      setRadius(computeRadius(annotation));
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [annotation]);

  return {
    radius,
    handleApplyRadiusLength,
    handleEnterKeyPressOnRadiusInput,
    onChangeRadiusLength,
    radiusUnit: getFormattedUnit(
      (annotation?.Scale as [[number, string], [number, string]])?.[1]?.[1] || selectedScale?.scale.worldScale.unit
    ),
  };
};
