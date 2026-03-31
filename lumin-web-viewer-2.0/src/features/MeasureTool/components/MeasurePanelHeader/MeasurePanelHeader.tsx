import { Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import DistanceProperties from './DistanceProperties';
import EllipseProperties from './EllipseProperties';

import styles from './MeasurePanelHeader.module.scss';

interface MeasurePanelHeaderProps {
  selectedAnnotations: Core.Annotations.Annotation[];
  properties: {
    title: string;
    precision: number;
    distance?: boolean;
    ellipse?: boolean;
    content?: {
      label: string;
      value: string;
    };
    radius?: string;
    angle?: string;
  };
}

const MeasurePanelHeader = ({ properties, selectedAnnotations }: MeasurePanelHeaderProps) => {
  const { t } = useTranslation();
  const annotation = selectedAnnotations[0];
  const renderValue = () => (
    <div className={styles.field}>
      <label className={styles.label}>{properties.content.label}:</label>
      <span className={styles.value}>{properties.content.value || '0'}</span>
    </div>
  );

  const renderRadius = () => (
    <div className={styles.field}>
      <label className={styles.label}>{t('viewer.measureToolPanel.radius')}:</label>
      <span className={styles.value}>{properties.radius || '0'}</span>
    </div>
  );

  const renderAngle = () => (
    <div className={styles.field}>
      <label className={styles.label}>{t('viewer.measureToolPanel.angle')}:</label>
      <span className={styles.value}>{properties.angle || '0'}&deg;</span>
    </div>
  );

  if (selectedAnnotations.length > 1) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        <span className={styles.title}>{properties.title}</span>
        <div className={styles.field}>
          <label className={styles.label}>{t('viewer.measureTool.precision')}:</label>
          <span className={styles.value}>{properties.precision || '0.001'}</span>
        </div>
        {properties.distance && <DistanceProperties annotation={annotation as Core.Annotations.LineAnnotation} />}
        {properties.ellipse && <EllipseProperties annotation={annotation as Core.Annotations.EllipseAnnotation} />}
        {properties.content && renderValue()}
        {properties.radius && renderRadius()}
        {properties.angle && renderAngle()}
      </div>
      <Divider />
    </>
  );
};

export default MeasurePanelHeader;
