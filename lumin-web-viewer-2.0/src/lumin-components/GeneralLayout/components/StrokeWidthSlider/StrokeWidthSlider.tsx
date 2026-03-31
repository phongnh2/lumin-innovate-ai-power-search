import { isNaN } from 'lodash';
import React, { ChangeEventHandler } from 'react';

import Slider from 'luminComponents/GeneralLayout/general-components/Slider';
import TextField from 'luminComponents/GeneralLayout/general-components/TextField';
import Icomoon from 'luminComponents/Icomoon';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { MIN_THICKNESS, MAX_THICKNESS } from 'constants/formBuildTool';

import { IStrokeWidthSliderProps } from './StrokeWidthSlider.interface';

import * as Styled from './StrokeWidthSlider.styled';

const StrokeWidthSlider = ({
  style,
  onChange,
  sliderProps = {},
  max = MAX_THICKNESS,
  min = MIN_THICKNESS,
  hideInput = false,
}: IStrokeWidthSliderProps): JSX.Element => {
  const updateSliderValue = (value: number): void => {
    if (value >= min && value <= max) {
      const roundedValue = Math.round(value);
      onChange(ANNOTATION_STYLE.STROKE_THICKNESS, roundedValue);
    }
  };

  const onSliderChange = (_: Event, value: number): void => {
    updateSliderValue(value);
  };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = Number(event.currentTarget.value);
    if (!isNaN(inputValue)) {
      updateSliderValue(inputValue);
    }
  };

  return (
    <Styled.SliderWrapper>
      <Styled.Row data-cy="stroke_width_slider_wrapper">
        <Styled.Col>
          <Icomoon className="md_stroke" size={24} />
        </Styled.Col>

        <Styled.SliderCol>
          <Slider onChange={onSliderChange} value={style.StrokeThickness} max={max} min={min} {...sliderProps} />
        </Styled.SliderCol>

        {!hideInput && (
          <Styled.InputCol data-cy="stroke_width_input_wrapper">
            <TextField
              onChange={onInputChange}
              value={style.StrokeThickness}
              endAdornment={<span>pt</span>}
              sx={{
                textAlign: 'center',
              }}
              componentsProps={{
                input: {
                  ...({ 'data-cy': 'slider_input' } as React.InputHTMLAttributes<HTMLInputElement>),
                },
              }}
            />
          </Styled.InputCol>
        )}
      </Styled.Row>
    </Styled.SliderWrapper>
  );
};

export default StrokeWidthSlider;
