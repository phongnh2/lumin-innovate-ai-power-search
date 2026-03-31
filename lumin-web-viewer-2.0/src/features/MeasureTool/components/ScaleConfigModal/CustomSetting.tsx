import classNames from 'classnames';
import { Button, NumberInput, Paper, Select } from 'lumin-ui/kiwi-ui';
import React, { ChangeEvent, useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { DisplayUnit, PaperUnit } from 'features/MeasureTool/constants';
import { getDisplayUnitData } from 'features/MeasureTool/utils';

import { getDecimalScale } from './utils/getDecimalScale';
import { getPaperUnitData } from './utils/getPaperUnitData';
import FeetInchInput from '../FeetInchInput';

import styles from './ScaleConfigModal.module.scss';

type CustomSettingProps = {
  isFractional: boolean;
  displayUnit: DisplayUnit;
  onChangeDisplayUnit: (unit: DisplayUnit) => void;
  paperUnit: PaperUnit;
  onChangePaperUnit: (unit: PaperUnit) => void;
  paperDistance: string;
  onPaperDistanceChange: (value: string) => void;
  displayDistance: string;
  onDisplayDistanceChange: (value: string) => void;
  precision: number;
  openCalibrationTool: () => void;
};

const CustomSetting = ({
  isFractional,
  displayUnit,
  onChangeDisplayUnit,
  paperUnit,
  onChangePaperUnit,
  paperDistance,
  onPaperDistanceChange,
  displayDistance,
  onDisplayDistanceChange,
  precision,
  openCalibrationTool,
}: CustomSettingProps) => {
  const { t } = useTranslation();
  const renderDisplayUnitDropdown = useCallback(
    () => (
      <Select
        value={displayUnit}
        data={getDisplayUnitData(isFractional)}
        onChange={(value, option) => onChangeDisplayUnit(option?.value as DisplayUnit)}
      />
    ),
    [displayUnit, isFractional, onChangeDisplayUnit]
  );

  const renderPaperUnitDropdown = useCallback(
    () => (
      <Select
        value={paperUnit}
        renderOption={(item) => item.option.label}
        data={getPaperUnitData(isFractional)}
        onChange={(value, option) => onChangePaperUnit(option?.value as PaperUnit)}
      />
    ),
    [isFractional, paperUnit, onChangePaperUnit]
  );

  const isFeetInchInput = displayUnit === 'ft-in' || isFractional;
  return (
    <div className={styles.scaleContainer}>
      <h2 className={styles.configTitle}>
        <span>{t('viewer.measureTool.scaleProperties')}</span>
        <Button variant="outlined" size="sm" onClick={openCalibrationTool}>
          {t('viewer.measureTool.calibrate')}
        </Button>
      </h2>
      <Paper radius="md" className={styles.customConfigSection}>
        <div>
          <h3 className={styles.fieldTitle}>{t('viewer.measureTool.paperUnit')}</h3>
          <div className={classNames(!isFractional && styles.inputGroup)}>
            {isFractional ? (
              <FeetInchInput
                value={paperDistance}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onPaperDistanceChange(event.target.value)}
                isFractional={isFractional}
                unitType={paperUnit as 'ft-in' | 'in'}
                rightElement={renderPaperUnitDropdown()}
              />
            ) : (
              <>
                <NumberInput
                  value={paperDistance}
                  onChange={(value: string) => onPaperDistanceChange(value)}
                  decimalScale={getDecimalScale(precision)}
                  fixedDecimalScale
                />
                {renderPaperUnitDropdown()}
              </>
            )}
          </div>
        </div>
        <div className={styles.equalSign}>=</div>
        <div>
          <h3 className={styles.fieldTitle}>{t('viewer.measureTool.drawingUnit')}</h3>
          <div className={classNames(!isFeetInchInput && styles.inputGroup)}>
            {isFeetInchInput ? (
              <FeetInchInput
                value={displayDistance}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onDisplayDistanceChange(event.target.value)}
                isFractional={isFractional}
                unitType={displayUnit as 'ft-in' | 'in'}
                rightElement={renderDisplayUnitDropdown()}
              />
            ) : (
              <>
                <NumberInput
                  value={displayDistance}
                  onChange={(value: string) => onDisplayDistanceChange(value)}
                  decimalScale={getDecimalScale(precision)}
                  fixedDecimalScale
                />
                {renderDisplayUnitDropdown()}
              </>
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default CustomSetting;
