import { Icomoon, Select, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { CompressDpiOptions } from 'features/CompressPdf/types';
import { getCompressDpiOptions } from 'features/CompressPdf/utils';

import styles from './CompressOptionsModal.module.scss';

interface DpiOptionsProps {
  disabled: boolean;
  currentDpi: number;
  setDpi: (dpi: number) => void;
}

const DpiOptions = ({ disabled, currentDpi, setDpi }: DpiOptionsProps) => {
  const { t } = useTranslation();
  const dpiOptions = getCompressDpiOptions(t);

  const optionMapper = (value: string) => dpiOptions.find((option) => option.value === Number(value));

  const renderOption = (option: CompressDpiOptions) => (
    <div className={styles.dpiOption}>
      <Icomoon type={option.icon} size="md" />
      <div className={styles.dpiOptionLabel}>
        <Text type="label" size="md" color="var(--kiwi-colors-core-on-primary-container)">
          {option.title}
        </Text>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
          {option.description}
        </Text>
      </div>
    </div>
  );

  return (
    <Select
      size="lg"
      disabled={disabled}
      style={{ width: '320px' }}
      comboboxProps={{ width: 'auto', position: 'bottom-start' }}
      data={dpiOptions.map((option) => ({
        value: option.value.toString(),
        label: option.title,
      }))}
      value={currentDpi.toString()}
      onChange={(value) => setDpi(Number(value))}
      renderOption={(item) => renderOption(optionMapper(item.option.value))}
    />
  );
};

export default DpiOptions;
