import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ToolName } from 'core/type';

import core from 'core';

import { getAngleInRadians } from 'features/MeasureTool/utils/getAngleInRadians';
import { getFormattedUnit } from 'features/MeasureTool/utils/getFormattedUnit';

import { TOOLS_NAME } from 'constants/toolsName';

import { computeAngle } from '../utils/computeAngle';

const isApproximatelyEqual = (value1: number, value2: number) => Math.abs(value1 - value2) < 0.1;
const getDistance = (annotation: Core.Annotations.LineAnnotation, factor: number) =>
  annotation instanceof Core.Annotations.LineAnnotation ? annotation.getLineLength() * factor : 0;

export const useDistancePropertyHandler = (annotation: Core.Annotations.LineAnnotation) => {
  const { factor } = annotation?.Measure.axis[0] || {};
  const displayUnit = annotation?.DisplayUnits[0];
  const [distance, setDistance] = useState(getDistance(annotation, factor));
  const [angle, setAngle] = useState(computeAngle(annotation));

  useEffect(() => {
    if (!annotation) {
      setAngle(0);
      setDistance(0);
      return undefined;
    }

    setDistance(getDistance(annotation, factor));
    setAngle(computeAngle(annotation));

    const onAnnotationChanged = () => {
      setDistance(getDistance(annotation, factor));
      setAngle(computeAngle(annotation));
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [annotation, factor]);

  const forceLineRedraw = useCallback(async () => {
    const annotationManager = core.getAnnotationManager();
    await annotationManager.drawAnnotations({ pageNumber: annotation.PageNumber });
    annotationManager.trigger('annotationChanged', [[annotation], 'modify', {}]);
  }, [annotation]);

  const getMaxLineLengthInPts = useCallback(() => {
    const currentPageNumber = core.getCurrentPage();
    const documentWidth = core.getPageWidth(currentPageNumber);
    const documentHeight = core.getPageHeight(currentPageNumber);
    const angleInDegrees = Number((annotation.getAngle() * (180 / Math.PI)).toFixed(2));
    const startPoint = annotation.getStartPoint();
    const startX = startPoint.x;
    const startY = startPoint.y;

    let maxX;
    let maxY;
    if (Math.abs(angleInDegrees) < 90) {
      maxX = documentWidth;
    } else {
      maxX = 0;
    }

    if (angleInDegrees > 0) {
      maxY = documentHeight;
    } else {
      maxY = 0;
    }

    const maxLenX = Math.abs((maxX - startX) / Math.cos(annotation.getAngle()));
    const maxLenY = Math.abs((maxY - startY) / Math.sin(annotation.getAngle()));

    return Math.min(maxLenX, maxLenY);
  }, [annotation]);

  const setLineAngle = (lineAngle: number) => {
    const angleInRadians = lineAngle * (Math.PI / 180) * -1;
    const lengthInPts = annotation.getLineLength();
    const start = annotation.Start;
    const endX = Math.cos(angleInRadians) * lengthInPts + start.x;
    const endY = Math.sin(angleInRadians) * lengthInPts + start.y;
    annotation.setEndPoint(endX, endY);
    annotation.adjustRect();
    forceLineRedraw().catch(() => {});
  };

  const finishAnnotation = () => {
    const tool = core.getTool(TOOLS_NAME.DISTANCE_MEASUREMENT as ToolName);
    tool.finish();
  };

  const ensureLineIsWithinBounds = useCallback(
    (lengthInPts: number) => {
      if (!isApproximatelyEqual(annotation.getLineLength(), lengthInPts)) {
        const maxLengthInPts = getMaxLineLengthInPts();
        annotation.setLineLength(Math.min(maxLengthInPts, lengthInPts));
        forceLineRedraw().catch(() => {});
      }
    },
    [annotation, forceLineRedraw, getMaxLineLengthInPts]
  );

  const validateLineLength = (lineLength: number) => {
    if (!annotation) {
      return;
    }
    let length = Math.abs(lineLength);
    if (length < annotation.Precision) {
      length = annotation.Precision;
    }
    const { factor: factorInPts } = annotation.Measure.axis[0];
    const lengthInPts = length / factorInPts;
    ensureLineIsWithinBounds(lengthInPts);
  };

  const onAngleChange = (value: number) => {
    setAngle(value);
  };

  const handleApplyAngleChange = () => {
    setLineAngle(Number(angle));
    finishAnnotation();
  };

  const onDistanceChange = (value: number) => {
    setDistance(value);
  };

  const handleApplyDistanceChange = () => {
    validateLineLength(Number(distance));
    finishAnnotation();
  };

  const handleKeyEnterPressOnDistanceInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleApplyDistanceChange();
    }
  };

  const handleEnterKeyPressOnAngleInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleApplyAngleChange();
    }
  };

  const getAnnotationUnit = (annotationObj: Core.Annotations.LineAnnotation) => {
    if (!annotationObj?.DisplayUnits?.length) {
      return '';
    }
    const [primaryUnit, secondaryUnit] = annotationObj.DisplayUnits;
    if (annotationObj.DisplayUnits.length === 2 && primaryUnit === "ft'" && secondaryUnit === 'in"') {
      return 'in';
    }
    return getFormattedUnit(primaryUnit);
  };

  const deltas = useMemo(() => {
    const angleInRadians = (annotation && getAngleInRadians(annotation.Start, annotation.End)) || 0;
    const unit = getAnnotationUnit(annotation);
    const deltaX = Core.Scale.getFormattedValue(
      annotation && Math.abs(Number(distance) * Math.cos(angleInRadians)),
      unit,
      annotation?.Precision
    );
    const deltaY = Core.Scale.getFormattedValue(
      annotation && Math.abs(Number(distance) * Math.sin(angleInRadians)),
      unit,
      annotation?.Precision
    );

    return { x: deltaX, y: deltaY };
  }, [annotation, distance]);

  return {
    distance,
    onDistanceChange,
    handleApplyDistanceChange,
    handleKeyEnterPressOnDistanceInput,
    displayUnit,
    angle,
    onAngleChange,
    handleApplyAngleChange,
    handleEnterKeyPressOnAngleInput,
    deltas,
  };
};
