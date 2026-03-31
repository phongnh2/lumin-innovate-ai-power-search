import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import SliderMaterial from 'lumin-components/SliderMaterial';
import ColorPaletteHeader from 'luminComponents/ColorPaletteHeader';
import FreeTextPaletteHeader from 'luminComponents/ColorPaletteHeader/FreeTextPaletteHeader';
import ColorPaletteLumin from 'luminComponents/ColorPaletteLumin';
import SliderLumin from 'luminComponents/SliderLumin';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { DataElements } from 'constants/dataElement';
import { AnnotationSubjectMapping, ANNOTATION_STYLE } from 'constants/documentConstants';
import { circleRadius } from 'constants/slider';
import toolsName, { TOOLS_NAME } from 'constants/toolsName';

import './StylePalette.scss';

const MAX_OPACITY = 100;
const MAX_STROKE_THICKNESS = 20;
const MAX_ERASER_STROKE_THICKNESS = 32;
const MIN_ERASER_STROKE_THICKNESS = 8;

class StylePalette extends React.PureComponent {
  isEraserTool = () => this.props.activeToolName === toolsName.ERASER;

  renderColorPalette = () => {
    const { style, onStyleChange, currentPalette, colorMapKey, annotation, placement } = this.props;
    if (this.isEraserTool()) {
      return null;
    }

    return (
      <ColorPaletteLumin
        color={annotation[currentPalette] || style[currentPalette]}
        property={currentPalette}
        onStyleChange={onStyleChange}
        colorMapKey={colorMapKey}
        annotation={annotation}
        placement={placement}
      />
    );
  };

  renderSliders = () => {
    const {
      style: { StrokeThickness },
      onStyleChange,
      isFreeText,
      annotation,
      isStrokeThicknessSliderDisabled,
      currentPalette,
    } = this.props;

    if (this.isEraserTool()) {
      return this.renderSliderMaterial({
        step: 8,
        min: MIN_ERASER_STROKE_THICKNESS,
        max: MAX_ERASER_STROKE_THICKNESS,
        defaultValue: 8,
        value: StrokeThickness,
      });
    }

    const sliderProps = [];
    const isTextTools = [toolsName.SQUIGGLY, toolsName.HIGHLIGHT, toolsName.UNDERLINE, toolsName.STRIKEOUT].includes(
      annotation.ToolName
    );
    if (!isStrokeThicknessSliderDisabled && currentPalette === ANNOTATION_STYLE.STROKE_COLOR && !isTextTools) {
      sliderProps.push({
        dataElement: DataElements.STROKE_THICKNESS_SLIDER,
        property: 'StrokeThickness',
        displayProperty: 'thickness',
        initialValue: StrokeThickness,
        convertValue: (inputValue) => Math.round(inputValue),
        limitValue: {
          max: MAX_STROKE_THICKNESS,
          // eslint-disable-next-line no-magic-numbers
          min: isFreeText ? 0 : 1,
        },
      });
    }

    return [StrokeThickness].map((value, index) => {
      if (value === null || value === undefined || !sliderProps[index]) {
        // we still want to render a slider if the value is 0
        return null;
      }

      const props = sliderProps[index];
      const key = props.property;

      return (
        <SliderLumin
          key={key}
          {...props}
          onStyleChange={onStyleChange}
          annotation={annotation}
          currentPalette={currentPalette}
        />
      );
    });
  };

  handleChangeSliderMaterial = (e, value) => {
    this.props.onStyleChange('StrokeThickness', value);
  };

  renderSliderMaterial = ({ step, min, max, defaultValue, value }) => (
    <div className="eraser-slider">
      <Icomoon className="size-stroke" size={14} />
      <SliderMaterial
        size="medium"
        step={step}
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        valueLabelDisplay="off"
        onChange={this.handleChangeSliderMaterial}
      />
    </div>
  );

  renderSliderOpacity = () => {
    const {
      style: { Opacity, FillColor, StrokeColor },
      onStyleChange,
      annotation,
      isOpacitySliderDisabled,
      currentPalette,
    } = this.props;
    const PERCENT_100 = 100;
    const lineStart = circleRadius;
    let sliderProps = null;
    if (!isOpacitySliderDisabled) {
      sliderProps = {
        FillColor,
        StrokeColor,
        dataElement: DataElements.OPACITY_SLIDER,
        property: 'Opacity',
        displayProperty: 'opacity',
        convertValue: (inputValue) => Math.round(inputValue) / PERCENT_100,
        limitValue: {
          max: PERCENT_100,
          min: 0,
        },
        initialValue: Math.round(Opacity * PERCENT_100),
        getCirclePosition: (lineLength, value) =>
          (value > MAX_OPACITY ? MAX_OPACITY / PERCENT_100 : value / PERCENT_100) * lineLength + lineStart,
        convertRelativeCirclePositionToValue: (circlePosition) => circlePosition * PERCENT_100,
      };
    }
    if (Opacity === null || Opacity === undefined || !sliderProps || this.isEraserTool()) {
      // we still want to render a slider if the value is 0
      return null;
    }
    return (
      <SliderLumin
        key={sliderProps?.property}
        {...sliderProps}
        onStyleChange={onStyleChange}
        annotation={annotation}
        currentPalette={currentPalette}
      />
    );
  };

  renderTextColorComponent = () => {
    const { colorMapKey, style, onStyleChange, annotation, isAnnotationStylePopup } = this.props;

    if (![annotationColorMapKey.FREE_TEXT, annotationColorMapKey.DATE_FREE_TEXT].includes(colorMapKey)) {
      return null;
    }

    return (
      <>
        <div className="colors-container" data-element={DataElements.COLOR_PALETTE}>
          <div className="inner-wrapper">
            <FreeTextPaletteHeader
              colorPalette={ANNOTATION_STYLE.TEXT_COLOR}
              colorMapKey={colorMapKey}
              style={style}
              onStyleChange={onStyleChange}
              annotation={annotation}
              isAnnotationStylePopup={isAnnotationStylePopup}
            />
            <ColorPaletteLumin
              color={style?.TextColor}
              property={ANNOTATION_STYLE.TEXT_COLOR}
              onStyleChange={onStyleChange}
              colorMapKey={colorMapKey}
            />
          </div>
        </div>
        <div className="divider horizontal" />
      </>
    );
  };

  render() {
    const {
      isColorPaletteDisabled,
      currentPalette,
      style,
      colorMapKey,
      isSignature,
      isOpacitySliderDisabled,
      isStrokeThicknessSliderDisabled,
      isFontSizeSliderDisabled,
      isStylePopupDisabled,
      onStyleChange,
      isAnnotationStylePopup,
      hideOpacitySlider,
      hideThicknessSlider,
      annotation,
      themeMode
    } = this.props;

    const hideAllSlider = isStrokeThicknessSliderDisabled && isFontSizeSliderDisabled;
    const newColorPalette =
      annotation && annotation.Subject === AnnotationSubjectMapping.redact ? 'FillColor' : currentPalette;

    if (isStylePopupDisabled) {
      return null;
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className={`Popup StylePalette theme-${themeMode}`} data-element={DataElements.STYLE_POPUP}>
        {this.renderTextColorComponent()}
        {currentPalette && !isSignature && !isColorPaletteDisabled && (
          <div className="colors-container" data-element={DataElements.COLOR_PALETTE}>
            <div className="inner-wrapper">
              <ColorPaletteHeader
                colorPalette={newColorPalette}
                colorMapKey={colorMapKey}
                style={style}
                onStyleChange={onStyleChange}
                isAnnotationStylePopup={isAnnotationStylePopup}
                annotation={annotation}
              />
              {!hideAllSlider && (
                <div className="sliders-container">
                  {!hideThicknessSlider && (
                    <div
                      className={classNames('sliders', {
                        'sliders__content-no-input': this.isEraserTool(),
                      })}
                    >
                      {this.renderSliders()}
                    </div>
                  )}
                </div>
              )}
              {this.renderColorPalette()}
            </div>
          </div>
        )}
        {!isOpacitySliderDisabled && currentPalette !== ANNOTATION_STYLE.TEXT_COLOR && !hideOpacitySlider && (
          <div className="sliders-container">
            <div className="sliders--opacity">{this.renderSliderOpacity()}</div>
          </div>
        )}
      </div>
    );
  }
}

StylePalette.propTypes = {
  style: PropTypes.object.isRequired,
  onStyleChange: PropTypes.func.isRequired,
  isFreeText: PropTypes.bool.isRequired,
  hideDivider: PropTypes.bool,
  colorMapKey: PropTypes.string,
  currentPalette: PropTypes.oneOf(['TextColor', 'StrokeColor', 'FillColor']),
  isColorPaletteDisabled: PropTypes.bool,
  isOpacitySliderDisabled: PropTypes.bool,
  isStrokeThicknessSliderDisabled: PropTypes.bool,
  isFontSizeSliderDisabled: PropTypes.bool,
  isStyleOptionDisabled: PropTypes.bool,
  isStylePopupDisabled: PropTypes.bool,
  isSignature: PropTypes.bool,
  annotation: PropTypes.object,
  isAnnotationStylePopup: PropTypes.bool,
  hideOpacitySlider: PropTypes.bool,
  hideThicknessSlider: PropTypes.bool,
  placement: PropTypes.string,
  activeToolName: PropTypes.string,
  themeMode: PropTypes.string.isRequired
};

StylePalette.defaultProps = {
  hideDivider: false,
  colorMapKey: '',
  currentPalette: 'TextColor',
  isColorPaletteDisabled: false,
  isOpacitySliderDisabled: false,
  isStrokeThicknessSliderDisabled: false,
  isFontSizeSliderDisabled: false,
  isStyleOptionDisabled: false,
  isStylePopupDisabled: false,
  isSignature: false,
  annotation: {},
  isAnnotationStylePopup: false,
  hideOpacitySlider: false,
  hideThicknessSlider: false,
  placement: 'bottom',
  activeToolName: '',
};

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state)
});

const mapDispatchToProps = () => ({});

export default withValidUserCheck(connect(mapStateToProps, mapDispatchToProps)(StylePalette), TOOLS_NAME.STICKY);
