import { Select } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import styles from '../FreeTextToolbar.module.scss';
import { useGetTextStyleOptions } from '../hooks/useGetTextStyleOptions';
import { BaseFreeTextToolbarSelectorProps } from '../types';

const FontSizeSelector = ({ style, onChange }: BaseFreeTextToolbarSelectorProps) => {
  const { sizes } = useGetTextStyleOptions({ style });
  const onSizeChange = (value: string) => {
    onChange(ANNOTATION_STYLE.FONT_SIZE, `${value}pt`);
  };
  return (
    <Select
      size="md"
      onChange={onSizeChange}
      style={{ width: '78px' }}
      value={style.FontSize?.split('pt')[0]}
      classNames={{ wrapper: styles.selectWrapper }}
      comboboxProps={{ width: 'auto', position: 'bottom-start', withinPortal: false }}
      data={sizes.map(({ value, label }) => ({ value, label }))}
    />
  );
};

export default FontSizeSelector;
