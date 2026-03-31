import { NumberInput } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { getFormattedUnit } from 'features/MeasureTool/utils/getFormattedUnit';

import { useDistancePropertyHandler } from './hooks/useDistancePropertyHandler';

import styles from './MeasurePanelHeader.module.scss';

interface DistancePropertiesProps {
  annotation?: Core.Annotations.LineAnnotation;
}

const DistanceProperties = ({ annotation }: DistancePropertiesProps) => {
  const { t } = useTranslation();
  const {
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
  } = useDistancePropertyHandler(annotation);

  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>{t('viewer.measureToolPanel.distance')}:</label>
        <NumberInput
          value={distance}
          className={styles.inputNumber}
          onChange={onDistanceChange}
          onBlur={handleApplyDistanceChange}
          onKeyDown={handleKeyEnterPressOnDistanceInput}
          size="sm"
          disabled={!annotation}
          decimalScale={4}
          fixedDecimalScale
        />
        <span className={styles.value}>{getFormattedUnit(displayUnit)}</span>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('viewer.measureToolPanel.angle')}:</label>
        <NumberInput
          className={styles.inputNumber}
          value={angle}
          onChange={onAngleChange}
          decimalScale={2}
          onBlur={handleApplyAngleChange}
          onKeyDown={handleEnterKeyPressOnAngleInput}
          size="sm"
          disabled={!annotation}
          fixedDecimalScale
        />
        <label className={styles.value}>°</label>
      </div>
      <div className={styles.field}>
        <div className={styles.label}>{t('viewer.measureToolPanel.xAxis')}:</div>
        <div className={styles.value}>{deltas.x}</div>
      </div>
      <div className={styles.field}>
        <div className={styles.label}>{t('viewer.measureToolPanel.yAxis')}:</div>
        <div className={styles.value}>{deltas.y}</div>
      </div>
    </>
  );
};

export default DistanceProperties;
