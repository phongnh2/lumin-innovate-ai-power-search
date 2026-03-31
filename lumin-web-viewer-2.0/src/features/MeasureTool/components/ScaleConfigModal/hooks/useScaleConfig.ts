import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import core from 'core';

import { convertUnits } from 'utils/convertUnits';

import {
  useScaleConversion,
  updateSettingsForFractionalMode,
  useScaleFormatting,
  calculateDecimalValue,
  formatPrecisionData,
} from 'features/MeasureTool/hooks';
import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';
import { isFractionalPrecision } from 'features/MeasureTool/utils';

import { TOOLS_NAME } from 'constants/toolsName';

import { useScaleState } from './useScaleState';
import { DisplayUnit, PaperUnit, PRECISION_DEFAULT_FOR_CALIBRATION } from '../../../constants';
import { canUseFractionalUnit } from '../constants';

export const useScaleConfig = () => {
  const {
    units,
    setUnits,
    isFractional,
    setIsFractional,
    precision,
    setPrecision,
    presetScale,
    setPresetScale,
    distances,
    setDistances,
  } = useScaleState();
  const configModal = useSelector(measureToolSelectors.getConfigModal);
  const dispatch = useDispatch();
  const { getFormattedCurrentValue, formatDisplayValue } = useScaleFormatting(isFractional);
  const { getConvertedValue } = useScaleConversion(getFormattedCurrentValue);

  const isDisableFractionalUnit = !canUseFractionalUnit(units.paperUnit, units.displayUnit);

  const precisionData = useMemo(() => formatPrecisionData(isFractional), [isFractional]);

  const onDisplayUnitChange = useCallback(
    (newDisplayUnit: DisplayUnit) => {
      if (newDisplayUnit === units.displayUnit || !newDisplayUnit) {
        return;
      }

      const formattedValue = getConvertedValue({
        value: distances.displayDistance,
        fromUnit: units.displayUnit,
        toUnit: newDisplayUnit,
        precisionValue: precision,
        isFractional,
      });

      setDistances((prev) => ({ ...prev, displayDistance: formattedValue }));
      setUnits((prev) => ({ ...prev, displayUnit: newDisplayUnit }));
    },
    [units.displayUnit, distances.displayDistance, precision, isFractional, getConvertedValue, setDistances, setUnits]
  );

  const onPaperUnitChange = useCallback(
    (newPaperUnit: PaperUnit) => {
      if (newPaperUnit === units.paperUnit || !newPaperUnit) {
        return;
      }

      const convertedValue = String(convertUnits(Number(distances.paperDistance), units.paperUnit, newPaperUnit));

      setDistances((prev) => ({ ...prev, paperDistance: convertedValue }));
      setUnits((prev) => ({ ...prev, paperUnit: newPaperUnit }));
    },
    [units.paperUnit, distances.paperDistance, setDistances, setUnits]
  );

  const handleFractionalChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const isUseFractionalUnits = event.target.checked;
      updateSettingsForFractionalMode(
        isUseFractionalUnits,
        units,
        distances,
        getConvertedValue,
        setIsFractional,
        setPresetScale,
        setPrecision,
        setDistances
      );
    },
    [units, distances, getConvertedValue, setIsFractional, setPresetScale, setPrecision, setDistances]
  );

  const handlePrecisionChange = useCallback(
    (value: string, option: { value: string }) => {
      if (!option) {
        return;
      }

      const currentPrecision = Number(option.value);
      const formattedDisplayValue = getConvertedValue({
        value: distances.displayDistance,
        fromUnit: units.displayUnit,
        toUnit: units.displayUnit,
        precisionValue: currentPrecision,
        isFractional,
      });

      setPrecision(currentPrecision);
      setDistances((prev) => ({ ...prev, displayDistance: formattedDisplayValue }));
    },
    [units.displayUnit, distances.displayDistance, isFractional, getConvertedValue, setPrecision, setDistances]
  );

  const getDecimalValue = (value: string, unit: DisplayUnit | PaperUnit): number =>
    calculateDecimalValue({ value, unit, isFractional });

  const setDisplayDistance = useCallback(
    (value: string) => {
      setDistances((prev) => ({ ...prev, displayDistance: value }));
    },
    [setDistances]
  );

  const setPaperDistance = useCallback(
    (value: string) => {
      setDistances((prev) => ({ ...prev, paperDistance: value }));
    },
    [setDistances]
  );

  const openCalibrationTool = () => {
    core.setToolMode(TOOLS_NAME.CALIBRATION_MEASUREMENT as ToolName);
    dispatch(measureToolActions.setConfigModal({ ...configModal, isOpen: false }));
  };

  useEffect(() => {
    const { isOpen, scaleInfo, calibrationScale } = configModal;

    if (isOpen && (scaleInfo?.scale || calibrationScale)) {
      const {
        pageScale: { unit: pageScaleUnit, value: pageScaleValue },
        worldScale: { unit: worldScaleUnit, value: worldScaleValue },
        precision: initialPrecision,
      } = calibrationScale || scaleInfo.scale;
      if (!pageScaleUnit || !worldScaleUnit || !pageScaleValue || !worldScaleValue) {
        return;
      }
      const precisionValue = initialPrecision || PRECISION_DEFAULT_FOR_CALIBRATION.DECIMAL;
      const isFractionalValue = isFractionalPrecision(precisionValue);
      const paperDistance = formatDisplayValue({
        value: pageScaleValue,
        unit: pageScaleUnit,
        precisionValue,
        isFractional: isFractionalValue,
      });
      const displayDistance = formatDisplayValue({
        value: worldScaleValue,
        unit: worldScaleUnit,
        precisionValue,
        isFractional: isFractionalValue,
      });
      setUnits({
        paperUnit: pageScaleUnit as PaperUnit,
        displayUnit: worldScaleUnit as DisplayUnit,
      });
      setDistances({
        paperDistance,
        displayDistance,
      });
      setPrecision(precisionValue);
      setIsFractional(isFractionalValue);
    }
  }, [configModal]);

  return {
    isFractional,
    displayUnit: units.displayUnit,
    paperUnit: units.paperUnit,
    presetScale,
    precision,
    paperDistance: distances.paperDistance,
    displayDistance: distances.displayDistance,
    getDecimalValue,
    getConvertedValue,
    onDisplayUnitChange,
    onPaperUnitChange,
    handleFractionalChange,
    handlePrecisionChange,
    isDisableFractionalUnit,
    setPresetScale,
    setDisplayDistance,
    setPaperDistance,
    precisionData,
    openCalibrationTool,
  };
};
