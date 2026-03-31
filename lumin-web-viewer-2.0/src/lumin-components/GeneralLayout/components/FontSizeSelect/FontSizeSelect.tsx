import React from 'react';

import Select from 'lumin-components/GeneralLayout/general-components/Select';

import { array as arrayUtils } from 'utils';

import { MIN_FONT_SIZE, MAX_FONT_SIZE } from 'constants/contentEditTool';

import { IFontSizeSelectProps, ISelectOption } from './FontSizeSelect.interface';

const FontSizeSelect = ({ maxFontSize, onChange, value: passedValue }: IFontSizeSelectProps): JSX.Element => {
  const value = passedValue ? Number(passedValue.replace('pt', '')) : '';

  const options = (arrayUtils.createRangeArray(MIN_FONT_SIZE, maxFontSize || MAX_FONT_SIZE) || []).map(
    (fontSize: number) => ({
      value: fontSize,
      label: `${fontSize} pt`,
    })
  );

  const handleChangeSelect = (_: React.FormEvent<HTMLInputElement>, option: ISelectOption): void => {
    const { value: valueFromOption } = option;
    onChange(`${valueFromOption}pt`);
  };

  return (
    <Select
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      value={value}
      options={options}
      onChange={handleChangeSelect}
      slotProps={{
        popper: {
          disablePortal: true,
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
          ],
        },
      }}
      data-cy="font_size_select"
    />
  );
};

export default FontSizeSelect;
