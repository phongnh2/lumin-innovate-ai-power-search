import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { CustomPicker } from 'react-color';
import { Alpha } from 'react-color/lib/components/common';
import Input from 'luminComponents/Shared/Input';

import './SliderLumin.scss';

import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import Pointer from './Pointer';

const SliderAlpha = ({
  rgb, hsl, hsv, renderers, extension, sliderValue, setSliderValue, changeSlider, handleOnBlur, property, displayProperty,
}) => {
  const [inputValue, setInputValue] = useState(sliderValue);

  const handleChangeInput = (e) => {
    setSliderValue(e);
  };

  const onMouseDown = () => {
    const sgv = document.getElementById(`${property}-${displayProperty}`);
    sgv.style.cursor = 'grabbing';
  };

  const onMouseUp = () => {
    const sgv = document.getElementById(`${property}-${displayProperty}`);
    sgv.style.cursor = 'pointer';
  };

  const handleChangeSlider = (color) => {
    const value = color?.a * 100;
    changeSlider(value);
  };

  useEffect(() => {
    if (sliderValue <= 100) {
      setInputValue(sliderValue);
    }
  }, [sliderValue]);

  return (
    <>
      <div id={`${property}-${displayProperty}`} onMouseDown={onMouseDown} onMouseUp={onMouseUp} className="slider__alpha">
        <Alpha
          width={189}
          rgb={{ ...rgb, a: inputValue / 100 }}
          hsl={hsl}
          hsv={hsv}
          renderers={renderers}
          onChange={handleChangeSlider}
          pointer={Pointer}
        />
      </div>
      <div className="slider__value">
        <Input
          postfix={<span className="SliderLumin__extension">{extension}</span>}
          value={String(sliderValue)}
          onChange={handleChangeInput}
          onBlur={handleOnBlur}
          size={InputSize.TINY}
        />
      </div>
    </>
  );
};

SliderAlpha.propTypes = {
  renderers: PropTypes.any,
  sliderValue: PropTypes.number,
  extension: PropTypes.string,
  property: PropTypes.string,
  displayProperty: PropTypes.string,
  rgb: PropTypes.object,
  hsl: PropTypes.object,
  hsv: PropTypes.object,
  setSliderValue: PropTypes.func,
  changeSlider: PropTypes.func,
  handleOnBlur: PropTypes.func,
};

SliderAlpha.defaultProps = {
  renderers: {},
  sliderValue: 0,
  extension: '',
  property: '',
  displayProperty: '',
  rgb: {},
  hsl: {},
  hsv: {},
  setSliderValue: () => {},
  changeSlider: () => {},
  handleOnBlur: () => {},
};

export default CustomPicker(SliderAlpha);
