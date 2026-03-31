import React from 'react';
import PropTypes from 'prop-types';
import {
  StyledButton, StyledSlider, StyledCustomThumbImage,
  SlideToolTipText,
} from './Slider.styled';

const propTypes = {
  onChange: PropTypes.func,
  customCss: PropTypes.array,
  min: PropTypes.number,
  max: PropTypes.number,
  minDistance: PropTypes.number,
  step: PropTypes.number,
  defaultValue: PropTypes.number,
  customThumbImage: PropTypes.string,
  toolTip: PropTypes.string,
  disabled: PropTypes.bool,
  sizeThumbImage: PropTypes.number,
  trackColor: PropTypes.string,
  customCssTooltip: PropTypes.array,
};

const defaultProps = {
  onChange: () => {},
  customCss: [],
  min: 1,
  max: 100,
  minDistance: 1,
  step: 1,
  defaultValue: 1,
  customThumbImage: '',
  toolTip: '',
  disabled: false,
  sizeThumbImage: 20,
  trackColor: '',
  customCssTooltip: [],
};

const Slider = ({
  onChange,
  customCss,
  min,
  max,
  minDistance,
  step,
  defaultValue,
  customThumbImage,
  disabled,
  toolTip,
  sizeThumbImage,
  trackColor,
  customCssTooltip,
  ...props
}) => {
  const Thumb = (props) => (
    customThumbImage ? (
      <StyledCustomThumbImage image={customThumbImage} {...props} disabled={disabled} sizeThumbImage={sizeThumbImage}>
        {toolTip && (
          <SlideToolTipText
            customCssTooltip={customCssTooltip}
            dangerouslySetInnerHTML={{
              __html: toolTip,
            }}
          />
        )}
      </StyledCustomThumbImage>
    ) : (
      <StyledButton {...props}>
        {toolTip &&
          <SlideToolTipText
            customCssTooltip={customCssTooltip}
            dangerouslySetInnerHTML={{
              __html: toolTip,
            }}
          />}
      </StyledButton>)
  );

  return (
    <StyledSlider
      customCss={customCss}
      trackClassName="track"
      renderThumb={Thumb}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      minDistance={minDistance}
      defaultValue={defaultValue}
      trackColor={trackColor}
      {...props}
    />
  );
};

Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;

export default Slider;
