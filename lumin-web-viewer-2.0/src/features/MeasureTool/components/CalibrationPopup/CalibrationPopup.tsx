import classNames from 'classnames';
import { Button, Checkbox, NumberInput, Paper, Select } from 'lumin-ui/kiwi-ui';
import React, { ChangeEvent, useCallback } from 'react';

import core from 'core';

import { useCleanup } from 'hooks/useCleanup';
import { useTranslation } from 'hooks/useTranslation';

import { PRECISION_DEFAULT_FOR_CALIBRATION, DisplayUnit } from 'features/MeasureTool/constants';
import { getDisplayUnitData } from 'features/MeasureTool/utils';

import { useCalibrationPopupHandler } from './hooks/useCalibrationPopupHandler';
import FeetInchInput from '../FeetInchInput';
import { getDecimalScale } from '../ScaleConfigModal/utils/getDecimalScale';

import styles from './CalibrationPopup.module.scss';

const CalibrationPopup = ({ annotation }: { annotation: Core.Annotations.LineAnnotation }) => {
  const {
    isFractional,
    displayDistance,
    displayUnit,
    setDisplayDistance,
    handleApplyCalibration,
    onDisplayUnitChange,
    onIsFractionalChange,
    isFractionalUnitSupported,
    isFeetInchInput,
  } = useCalibrationPopupHandler(annotation);
  const { t } = useTranslation();

  useCleanup(() => core.deleteAnnotations([annotation]), [annotation]);

  const renderDisplayUnitDropdown = useCallback(
    () => (
      <Select
        className={styles.select}
        value={displayUnit}
        data={getDisplayUnitData(isFractional)}
        onChange={(value: DisplayUnit) => onDisplayUnitChange(value)}
      />
    ),
    [displayUnit, isFractional, onDisplayUnitChange]
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('viewer.measureTool.unit')}</h2>
      <div>
        <Paper radius="md" className={styles.paperContainer}>
          <h3 className={styles.description}>{t('viewer.measureTool.calibrationInputDescription')}</h3>
          <div className={styles.inputContainer}>
            {isFeetInchInput ? (
              <FeetInchInput
                value={displayDistance}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDisplayDistance(event.target.value)}
                isFractional={isFractional}
                unitType={displayUnit as 'ft-in' | 'in'}
                rightElement={renderDisplayUnitDropdown()}
              />
            ) : (
              <>
                <NumberInput
                  value={displayDistance}
                  onChange={(value: string) => setDisplayDistance(value)}
                  decimalScale={getDecimalScale(PRECISION_DEFAULT_FOR_CALIBRATION.DECIMAL)}
                  fixedDecimalScale
                />
                {renderDisplayUnitDropdown()}
              </>
            )}
          </div>
        </Paper>
        <Checkbox
          classNames={{
            label: classNames(styles.checkboxLabel, {
              [styles.checkboxLabelDisabled]: !isFractionalUnitSupported,
            }),
          }}
          className={styles.checkbox}
          size="sm"
          label={t('viewer.measureTool.fractionalUnits')}
          checked={isFractional}
          onChange={onIsFractionalChange}
          disabled={!isFractionalUnitSupported}
        />
      </div>
      <Button onClick={handleApplyCalibration}>Apply</Button>
    </div>
  );
};

export default CalibrationPopup;
