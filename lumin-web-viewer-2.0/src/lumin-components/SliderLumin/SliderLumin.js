/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/no-access-state-in-setstate */

import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'luminComponents/Tooltip';
import Icomoon from 'luminComponents/Icomoon';

import { isIE11 } from 'helpers/device';
import Input from 'luminComponents/Shared/Input';
import SliderMaterial from 'luminComponents/SliderMaterial';
import core from 'core';

import './SliderLumin.scss';
import { debounce } from 'lodash';

import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import AlphaPicker from './SliderAlpha';

const propTypes = {
  property: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  displayProperty: PropTypes.string.isRequired,
  dataElement: PropTypes.string.isRequired,
  onStyleChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  limitValue: PropTypes.object.isRequired,
  annotation: PropTypes.object.isRequired,
  convertValue: PropTypes.func.isRequired,
};

const defaultProps = {
  initialValue: 0,
};

class Slider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sliderValue: this.props.initialValue,
    };
    this.debounceInput = debounce(this.onChange, 700);
  }

  componentDidMount() {
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
  }

  componentWillUnmount() {
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
  }

  onAnnotationChanged = () => {
    const { annotation } = this.props;
    if (annotation.Subject === 'Free text' && annotation.getContents() && (annotation.Width < 50 || annotation.Height < 20)) {
      const doc = core.getDocument();
      const pageNumber = core.getCurrentPage();
      const pageInfo = doc.getPageInfo(pageNumber);
      const pageMatrix = doc.getPageMatrix(pageNumber);
      const pageRotation = doc.getPageRotation(pageNumber);
      annotation.fitText(pageInfo, pageMatrix, pageRotation);
      core.getAnnotationManager().redrawAnnotation(annotation);
    }
  };

  handleUpdateStyle = (value) => {
    const {
      property, onStyleChange, convertValue,
    } = this.props;

    this.setState({ sliderValue: parseInt(value) });

    onStyleChange(property, convertValue(value));
  };

  onChange = (value) => {
    const { limitValue: { max, min } } = this.props;
    value = Number(value);
    if (value >= Number(min) && value <= Number(max)) {
      this.handleUpdateStyle(value);
    }
  };

  handleChangeSliderMaterial =(e, value) => {
    this.handleUpdateStyle(value);
  };

  handleChangeInput = (event) => {
    const { value } = event.target;

    if (value && Number.isNaN(Number(value))) return;

    this.setState({ sliderValue: parseInt(value) || 0 });
    this.debounceInput(value);
  };

  handleOnBlur = (e) => {
    const { limitValue: { max, min } } = this.props;
    const value = Number(e.target.value);
    if (value < Number(min) || value > Number(max)) {
      const inRangeValue = Math.max(Number(min), Math.min(Number(max), Number(value)));
      this.handleUpdateStyle(inRangeValue);
    }
  };

  getExtension = () => {
    const { property } = this.props;
    return property === 'Opacity' ? '%' : 'pt';
  };

  renderSlider = () => {
    const {
      dataElement, displayProperty, t, property,
      initialValue, limitValue,
    } = this.props;
    const { sliderValue } = this.state;
    return (
      <>
        <div className="slider__property" data-element={dataElement}>
          <Tooltip content={displayProperty !== 'thickness' ? t(`option.slider.${displayProperty}`) : t("common.borderSize")}>
            <div>
              {property === 'FontSize' ? (
                <Icomoon className="text-font-size" size={22} />
              ) : (
                <Icomoon className="size-stroke" size={16} />
              )}
            </div>
          </Tooltip>
        </div>
        <SliderMaterial
          step={1}
          onChange={this.handleChangeSliderMaterial}
          defaultValue={initialValue}
          value={sliderValue}
          min={limitValue.min}
          max={limitValue.max}
        />
        <div className="slider__value">
          <Input
            value={String(sliderValue)}
            postfix={<span className="SliderLumin__extension">{this.getExtension()}</span>}
            onChange={this.handleChangeInput}
            onBlur={this.handleOnBlur}
            size={InputSize.TINY}
          />
        </div>
      </>
    );
  };

  renderSliderOpacity = () => {
    const { property, displayProperty } = this.props;
    const { sliderValue } = this.state;
    return (
      <AlphaPicker
        color="#102D42"
        extension={this.getExtension()}
        sliderValue={sliderValue}
        changeSlider={this.onChangeOpacityInputValue}
        setSliderValue={this.handleChangeInput}
        handleOnBlur={this.handleOnBlur}
        property={property}
        displayProperty={displayProperty}
      />
    );
  };

  onChangeOpacityInputValue = (value) => {
    this.setState({ sliderValue: parseInt(value) });
    this.onChange(value);
  };

  render() {
    const { property } = this.props;
    if (isIE11) {
      // We use css Grid to place sliders responsively,
      // since IE11 only supports the old Grid, we use css Flexbox
      return (
        <div className="slider">
          {this.renderSlider()}
        </div>
      );
    }

    if (property === 'Opacity') {
      return this.renderSliderOpacity();
    }

    return this.renderSlider();
  }
}

Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;

export default Slider;
