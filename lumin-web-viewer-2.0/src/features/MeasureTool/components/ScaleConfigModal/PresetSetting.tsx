import { Paper, Select } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import styles from './ScaleConfigModal.module.scss';

type PresetSettingProps = {
  presetScale: string;
  setPresetScale: (scale: string) => void;
  commonScaleFactors: {
    value: number | Core.Scale;
    label: string;
  }[];
};

const PresetSetting = ({ presetScale, setPresetScale, commonScaleFactors }: PresetSettingProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.scaleContainer}>
      <h2 className={styles.configTitle}>{t('viewer.measureTool.scaleProperties')}</h2>
      <Paper radius="md" className={styles.configSection}>
        <h3 className={styles.fieldTitle}>{t('viewer.measureTool.commonScaleFactors')}</h3>
        <Select
          data={commonScaleFactors.map((item) => ({
            label: item.label,
            value: item.value.toString(),
          }))}
          value={presetScale.toString()}
          style={{ width: '100%' }}
          onChange={(value) => setPresetScale(value)}
          renderOption={(item) => item.option.label}
        />
      </Paper>
    </div>
  );
};

export default PresetSetting;
