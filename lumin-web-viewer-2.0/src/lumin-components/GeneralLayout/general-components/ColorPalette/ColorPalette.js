import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import tinycolor from 'tinycolor2';

import { AnnotationPopupContext } from '@new-ui/components/AnnotationPopup/AnnotationPopupContext';
import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import ColorPickerCell from 'lumin-components/GeneralLayout/general-components/ColorPickerCell';

import { getPaletteFromToolName } from 'utils/colorPalette';

import { TOOLS_NAME } from 'constants/toolsName';

import ColorCell from './components/ColorCell';

import * as Styled from './ColorPalette.styled';

const shiftAndPush = (arr, element) => {
  const res = [...arr];
  if (!res.includes(element)) {
    res.shift();
    res.push(element);
  }
  return res;
};
const transparentColor = 'rgba(0, 0, 0, 0)';

const isColorMatch = (colorValue, option) => tinycolor(colorValue).toHex8String() === tinycolor(option).toHex8String();

const convertToRGBAString = (colorData) => {
  if (typeof colorData === 'object') {
    return `rgba(${colorData.R}, ${colorData.G}, ${colorData.B}, ${colorData.A})`;
  }
  return colorData;
};

const getColorPaletteOptions = ({ toolName, optionsFromProps, valueFromProps, hasAssociatedLink }) => {
  const colorPaletteOptions = [
    ...(optionsFromProps.length ? optionsFromProps : getPaletteFromToolName({ toolName, hasAssociatedLink })),
  ];

  const color = convertToRGBAString(valueFromProps);

  if (!colorPaletteOptions.includes(color) && !isColorMatch(color, transparentColor)) {
    return shiftAndPush(colorPaletteOptions, color);
  }

  return colorPaletteOptions;
};

// NOTE: only working with rgba color type
const ColorPalette = ({
  options: optionsFromProps = [],
  value: valueFromProps,
  onChange,
  disabled = false,
  className = '',
  includeNoFill = false,
  disablePortal = false,
}) => {
  const activeToolName = useSelector(selectors.getActiveToolName);
  const annotationPopupContext = useContext(AnnotationPopupContext) || {};
  const { annotation = {}, hasAssociatedLink } = annotationPopupContext;

  const [options, setOptions] = useState(() =>
    getColorPaletteOptions({
      toolName: annotation.ToolName || activeToolName,
      optionsFromProps,
      valueFromProps,
      hasAssociatedLink,
    })
  );

  const value = useMemo(() => convertToRGBAString(valueFromProps), [valueFromProps]);

  const onItemClick = (color) => {
    // eslint-disable-next-line no-magic-numbers
    const rgba = color ? color.slice(color.indexOf('(') + 1, -1).split(',') : [0, 0, 0, 0];
    const apryseColor = new window.Core.Annotations.Color(rgba[0], rgba[1], rgba[2], rgba[3]);

    onChange(color, apryseColor);
  };

  const onPaletteChange = (color) => {
    onItemClick(color);
    setOptions(shiftAndPush(options, color));
  };

  return (
    <Styled.ColorPaletteWrapper $disabled={disabled} className={className} data-cy="color_palette_wrapper">
      {includeNoFill && <ColorCell noFill onClick={onItemClick} active={value === 'rgba(0, 0, 0, 0)'} />}
      {options.map((option) => (
        <ColorCell color={option} key={option} onClick={onItemClick} active={isColorMatch(value, option)}>
          {option}
        </ColorCell>
      ))}
      <ColorPickerCell setPalette={onPaletteChange} initialColor={valueFromProps} disablePortal={disablePortal} />
    </Styled.ColorPaletteWrapper>
  );
};

ColorPalette.propTypes = {
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  includeNoFill: PropTypes.bool,
  disablePortal: PropTypes.bool,
};

export default withValidUserCheck(ColorPalette, TOOLS_NAME.STICKY);
