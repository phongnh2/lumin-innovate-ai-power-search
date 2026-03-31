import { NumberInput } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { useCropPanelContext } from '../../CropPanelContext';
import { formatValueForDisplay, pixelsToUnit, unitToPixels } from '../../utils/unitConverter';

import styles from './CropDimension.module.scss';

interface DimensionInputProps {
  label: string;
  value: number;
  field: string;
  labelWithUnit?: boolean;
}

const DimensionInput = ({ label, value, field, labelWithUnit = true }: DimensionInputProps) => {
  const { unit, cropDimension, setCropDimension } = useCropPanelContext();

  const displayValue = useMemo(() => {
    const convertedValue = pixelsToUnit(value || 0, unit);
    return formatValueForDisplay(convertedValue, unit);
  }, [value, unit]);

  const handleChange = (input: string) => {
    const numericValue = Number(input);
    const pixelValue = unitToPixels(numericValue, unit);

    setCropDimension({
      ...cropDimension,
      [field]: pixelValue,
    });
  };

  return (
    <div className={styles.group}>
      <span className={styles.label}>
        {label} {labelWithUnit && `(${unit})`}
      </span>
      <NumberInput min={0} value={displayValue} onChange={handleChange} />
    </div>
  );
};

export default DimensionInput;
