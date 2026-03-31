import { NumberInput } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useEllipsePropertyHandler } from './hooks/useEllipsePropertyHandler';

import styles from './MeasurePanelHeader.module.scss';

interface EllipsePropertiesProps {
  annotation?: Core.Annotations.EllipseAnnotation;
}

const EllipseProperties = ({ annotation }: EllipsePropertiesProps) => {
  const { t } = useTranslation();
  const { radius, radiusUnit, onChangeRadiusLength, handleApplyRadiusLength, handleEnterKeyPressOnRadiusInput } =
    useEllipsePropertyHandler(annotation);

  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>{t('viewer.measureToolPanel.area')}:</label>
        <label className={styles.value}>{annotation?.getMeasurementTextWithScaleAndUnits() || 0}</label>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('viewer.measureToolPanel.radius')}:</label>
        <NumberInput
          value={radius}
          className={styles.inputNumber}
          onChange={onChangeRadiusLength}
          onBlur={handleApplyRadiusLength}
          onKeyDown={handleEnterKeyPressOnRadiusInput}
          size="sm"
          disabled={!annotation}
          decimalScale={4}
          fixedDecimalScale
        />
        <span className={styles.value}>{radiusUnit}</span>
      </div>
    </>
  );
};

export default EllipseProperties;
