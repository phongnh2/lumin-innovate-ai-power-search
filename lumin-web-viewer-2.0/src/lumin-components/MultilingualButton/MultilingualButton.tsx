import React from 'react';

import { ButtonSize } from 'luminComponents/ButtonMaterial';

import { getLanguage } from 'utils/getLanguage';

import { LANGUAGES } from 'constants/language';

import { MultilingualButtonProps } from './MultilingualButton.interface';

import * as Styled from './MultilingualButton.styled';

const defaultProps = {
  isLongText: false,
  size: ButtonSize.MD,
};

const MultilingualButton = React.forwardRef((props: MultilingualButtonProps, ref) => {
  const { isLongText, ...otherProps } = props;

  const language = getLanguage() as LANGUAGES;

  return (
    <Styled.Button
      {...otherProps}
      $isLongText={isLongText}
      $size={props.size}
      $isEnglish={language === LANGUAGES.EN}
      ref={ref}
    />
  );
});

MultilingualButton.defaultProps = defaultProps;

export default MultilingualButton;
