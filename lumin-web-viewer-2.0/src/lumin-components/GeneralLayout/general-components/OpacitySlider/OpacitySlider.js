import { clamp } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Slider from 'lumin-components/GeneralLayout/general-components/Slider';
import TextField from 'lumin-components/GeneralLayout/general-components/TextField';

import { useTranslation } from 'hooks';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import * as Styled from './OpacitySlider.styled';

const OPACITY_LIMIT = {
  FLOOR: 0,
  CEIL: 100,
};

const OpacitySlider = ({ onChange, style, withTitle }) => {
  const actualValue = Math.round(style.Opacity * 100) || 0;

  const { t } = useTranslation();

  const bringValueUpward = (value) => {
    onChange(ANNOTATION_STYLE.OPACITY, value / 100);
  };

  const handleUpdateInputValue = (value) => {
    const roundedValue = Math.round(clamp(value, OPACITY_LIMIT.FLOOR, OPACITY_LIMIT.CEIL));
    bringValueUpward(roundedValue);
  };

  const onSliderChange = (_, value) => {
    handleUpdateInputValue(value);
  };

  const onInputChange = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    handleUpdateInputValue(value);
  };

  return (
    <Styled.Wrapper>
      {withTitle && <Styled.Title>{t('option.slider.opacity')}</Styled.Title>}

      <Styled.Row data-cy="opacity_slider_wrapper">
        <Styled.LeftCol>
          <Styled.FakeTrackerFg />

          <Styled.FakeTrackerBg />

          <Slider onChange={onSliderChange} value={actualValue} max={OPACITY_LIMIT.CEIL} min={OPACITY_LIMIT.FLOOR} />
        </Styled.LeftCol>

        <Styled.RightCol data-cy="opacity_input_wrapper">
          <TextField
            onChange={onInputChange}
            value={actualValue}
            endAdornment={<span>%</span>}
            sx={{
              textAlign: 'center',
            }}
            componentsProps={{
              input: {
                'data-cy': 'slider_input',
              }
            }}
          />
        </Styled.RightCol>
      </Styled.Row>
    </Styled.Wrapper>
  );
};

OpacitySlider.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  withTitle: PropTypes.bool,
};

OpacitySlider.defaultProps = {
  withTitle: false,
};

export default OpacitySlider;
