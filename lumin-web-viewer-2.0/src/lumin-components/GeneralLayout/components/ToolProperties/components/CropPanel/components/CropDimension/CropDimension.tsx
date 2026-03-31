import { Select } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { CROP_TYPE_VALUE, PRESET_OPTIONS, PRESET_OPTIONS_VALUE, UNITS_OPTIONS } from '../../constants';
import { useCropPanelContext } from '../../CropPanelContext';
import { useCropAnnotationChanged } from '../../hooks/useCropAnnotationChanged';
import { useCropPresetHandlers } from '../../hooks/useCropPresetHandlers';
import { PresetType, UnitType } from '../../types';
import MarginsDimension from '../MarginsDimension';
import PageBoxDimension from '../PageBoxDimension';

import styles from './CropDimension.module.scss';

const CropDimension = () => {
  const { t } = useTranslation();
  const { cropType, unit, preset, cropDimension, setUnit, setPreset, setCropDimension } = useCropPanelContext();

  useCropAnnotationChanged({ cropType, cropDimension, setCropDimension });

  useCropPresetHandlers({ preset, cropType, cropDimension, setCropDimension });

  const renderDimension = useCallback(() => {
    switch (cropType) {
      case CROP_TYPE_VALUE.CROP_MARGIN:
        return <MarginsDimension />;
      case CROP_TYPE_VALUE.CROP_PAGE_BOX:
        return <PageBoxDimension />;
      default:
        return <MarginsDimension />;
    }
  }, [cropType]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.group}>
        <span className={styles.label}>{t('common.preset')}</span>
        <Select
          value={preset}
          withCheckIcon
          data={PRESET_OPTIONS.map(({ label, value }) => ({
            label: value === PRESET_OPTIONS_VALUE.CUSTOM ? t(label) : label,
            value,
          }))}
          onChange={(value) => setPreset(value as PresetType)}
        />
      </div>

      {renderDimension()}

      <div className={styles.group}>
        <span className={styles.label}>{t('common.unit')}</span>
        <Select value={unit} withCheckIcon data={UNITS_OPTIONS} onChange={(value) => setUnit(value as UnitType)} />
      </div>
    </div>
  );
};

export default CropDimension;
