import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import core from 'core';

import {
  PRECISION_DEFAULT_FOR_CALIBRATION,
  DisplayUnit,
  FractionalUnitSupport,
  PaperUnit,
} from 'features/MeasureTool/constants';
import { useScaleConversion, useScaleFormatting } from 'features/MeasureTool/hooks';
import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';
import { parseMeasurementByAnnotation } from 'features/MeasureTool/utils';

import defaultTool from 'constants/defaultTool';

import { getDefaultPaperUnit } from '../utils/getDefaultPaperUnit';

export const useCalibrationPopupHandler = (annotation: Core.Annotations.LineAnnotation) => {
  const dispatch = useDispatch();

  const [displayDistance, setDisplayDistance] = useState('');
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>(DisplayUnit.in);
  const [paperDistance, setPaperDistance] = useState('');
  const [paperUnit, setPaperUnit] = useState<PaperUnit>(PaperUnit.in);
  const [isFractional, setIsFractional] = useState(false);
  const configModal = useSelector(measureToolSelectors.getConfigModal);

  const { getFormattedCurrentValue } = useScaleFormatting(isFractional);
  const { getConvertedValue } = useScaleConversion(getFormattedCurrentValue);

  const isFractionalUnitSupported = FractionalUnitSupport.includes(displayUnit);
  const precisionValue = isFractional
    ? PRECISION_DEFAULT_FOR_CALIBRATION.FRACTIONAL
    : PRECISION_DEFAULT_FOR_CALIBRATION.DECIMAL;

  const handleApplyCalibration = () => {
    const scaleRatio = {
      pageScale: { value: getFormattedCurrentValue(paperDistance, paperUnit), unit: paperUnit },
      worldScale: { value: getFormattedCurrentValue(displayDistance, displayUnit), unit: displayUnit },
    };
    const newScale = new Core.Scale(scaleRatio, precisionValue);
    dispatch(
      measureToolActions.setConfigModal({
        ...configModal,
        isOpen: true,
        calibrationScale: newScale,
      })
    );
    core.deleteAnnotations([annotation]);
    core.setToolMode(defaultTool as ToolName);
  };

  const onDisplayUnitChange = useCallback(
    (newDisplayUnit: DisplayUnit) => {
      if (newDisplayUnit === displayUnit || !newDisplayUnit) {
        return;
      }

      const formattedValue = getConvertedValue({
        value: displayDistance,
        fromUnit: displayUnit,
        toUnit: newDisplayUnit,
        precisionValue,
        isFractional,
      });

      setDisplayUnit(newDisplayUnit);
      setDisplayDistance(formattedValue);
    },
    [displayDistance, displayUnit, isFractional, precisionValue]
  );

  const onIsFractionalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isUseFractionalUnits = event.target.checked;
    const _precisionValue = isUseFractionalUnits
      ? PRECISION_DEFAULT_FOR_CALIBRATION.FRACTIONAL
      : PRECISION_DEFAULT_FOR_CALIBRATION.DECIMAL;
    const formatedDisplayDistance = getConvertedValue({
      value: displayDistance,
      fromUnit: displayUnit,
      toUnit: displayUnit,
      precisionValue: _precisionValue,
      isFractional: isUseFractionalUnits,
    });
    const formatedPaperDistance = getConvertedValue({
      value: paperDistance,
      fromUnit: paperUnit,
      toUnit: paperUnit,
      precisionValue: _precisionValue,
      isFractional: isUseFractionalUnits,
    });
    setDisplayDistance(formatedDisplayDistance);
    setPaperDistance(formatedPaperDistance);
    setIsFractional(isUseFractionalUnits);
  };

  const getMeasureFromAnnotation = useCallback(() => {
    const annotationDistance = parseMeasurementByAnnotation(annotation);
    if (annotationDistance) {
      const currentScale = annotation.Scale as any[][];
      const currentUnit = currentScale[1][1] as DisplayUnit;
      const defaultPaperUnit = getDefaultPaperUnit(currentUnit);
      const defaultPaperValue = getConvertedValue({
        value: annotationDistance.toString(),
        fromUnit: currentUnit,
        toUnit: defaultPaperUnit,
        precisionValue,
        isFractional,
      });
      setPaperDistance(defaultPaperValue);
      setPaperUnit(defaultPaperUnit);
      setDisplayDistance(defaultPaperValue);
      setDisplayUnit(currentUnit);
    }
  }, [annotation, isFractional, precisionValue]);

  useEffect(() => {
    getMeasureFromAnnotation();
  }, []);

  useEffect(() => {
    core.addEventListener('annotationChanged', getMeasureFromAnnotation);

    return () => {
      core.removeEventListener('annotationChanged', getMeasureFromAnnotation);
    };
  }, [getMeasureFromAnnotation]);

  return {
    displayDistance,
    displayUnit,
    setDisplayDistance,
    handleApplyCalibration,
    onDisplayUnitChange,
    isFractional,
    setIsFractional,
    onIsFractionalChange,
    isFractionalUnitSupported,
    isFeetInchInput: displayUnit === 'ft-in' || isFractional,
  };
};
