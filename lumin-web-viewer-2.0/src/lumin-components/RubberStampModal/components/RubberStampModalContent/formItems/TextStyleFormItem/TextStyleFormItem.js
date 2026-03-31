import React, { useContext } from 'react';

import IconButtonV2 from '@new-ui/general-components/IconButton';
import Select from '@new-ui/general-components/Select';

import { useTranslation } from 'hooks';

import TextColorPicker from './TextColorPicker';
import { fonts } from '../../constants';
import { RubberStampModalContentContext } from '../../RubberStampModalContent';

import * as Styled from './TextStyleFormItem.styled';

const TextStyleFormItem = () => {
  const { t } = useTranslation();
  const { formData } = useContext(RubberStampModalContentContext);
  const {
    font,
    setFont,
    bold,
    setBold,
    italic,
    setItalic,
    underline,
    setUnderline,
    strikeout,
    setStrikeout,
    textColor,
    setTextColor,
  } = formData;

  const onSelected = ({ value }) => {
    setFont(value);
  };

  const onTextColorChange = (_, color) => {
    setTextColor(color);
  };

  const renderDropdown = () => {
    const formatedFonts = fonts.map((font) => ({
      ...font,
      itemProps: {
        inheritFont: true,
        style: {
          fontFamily: font.value,
        },
      },
    }));

    return (
      <Select
        value={font}
        options={formatedFonts}
        labelKey="name"
        onChange={(e, { value }) => onSelected({ value })}
        inputProps={{ style: { fontFamily: font } }}
        style={{ width: '160px' }}
      />
    );
  };

  const getIconButtonProps = ({ active }) => ({
    active,
    iconSize: 24,
  });

  return (
    <Styled.Container data-new-layout>
      <Styled.Label data-new-layout>{t('documentPage.textStyle')}</Styled.Label>

      <Styled.ContentWrapper data-new-layout>
        {renderDropdown()}

        <Styled.Divider />

        <Styled.ButtonsContainer data-new-layout>
          <IconButtonV2
            onClick={() => {
              setBold((prev) => !prev);
            }}
            {...getIconButtonProps({ active: bold })}
            icon="md_bold"
          />

          <IconButtonV2
            onClick={() => {
              setItalic((prev) => !prev);
            }}
            {...getIconButtonProps({ active: italic })}
            icon="md_italic"
          />

          <IconButtonV2
            onClick={() => {
              setUnderline((prev) => !prev);
            }}
            {...getIconButtonProps({ active: underline })}
            icon="md_underline"
          />

          <IconButtonV2
            onClick={() => {
              setStrikeout((prev) => !prev);
            }}
            {...getIconButtonProps({ active: strikeout })}
            icon="md_strike_though"
          />

          <TextColorPicker textColor={textColor} onTextColorChange={onTextColorChange} />
        </Styled.ButtonsContainer>
      </Styled.ContentWrapper>
    </Styled.Container>
  );
};;

export default TextStyleFormItem;
