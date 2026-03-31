import { Select } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import styles from '../FreeTextToolbar.module.scss';
import { useGetTextStyleOptions } from '../hooks/useGetTextStyleOptions';
import { BaseFreeTextToolbarSelectorProps } from '../types';

const FontFamilySelector = ({ style, onChange }: BaseFreeTextToolbarSelectorProps) => {
  const { fonts } = useGetTextStyleOptions({ style });
  const onFontChange = (value: string) => {
    onChange(ANNOTATION_STYLE.FONT, value);
  };
  return (
    <Select
      size="md"
      value={style.Font}
      onChange={onFontChange}
      style={{ width: '108px' }}
      classNames={{ wrapper: styles.selectWrapper }}
      comboboxProps={{ width: 'auto', position: 'bottom-start', withinPortal: false }}
      data={fonts.map(({ value, label }) => ({ value, label }))}
      styles={{ input: { fontFamily: style.Font } }}
      renderOption={(option) => <div style={{ fontFamily: option.option.value }}>{option.option.label}</div>}
    />
  );
};

export default FontFamilySelector;
