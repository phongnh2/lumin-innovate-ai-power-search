/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Tooltip';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { AnnotationSubjectMapping, ANNOTATION_STYLE } from 'constants/documentConstants';
import { getDataWithKey } from 'constants/map';
import { PREMIUM_FEATURE_NAME, TOOLS_NAME } from 'constants/toolsName';

import './ColorPaletteHeader.scss';

class ColorPaletteHeader extends React.PureComponent {
  setActivePalette = (newPalette) => {
    const { setActivePalette, colorMapKey } = this.props;
    setActivePalette(colorMapKey, newPalette);
  };

  renderBorderColorIcon = () => {
    const {
      style: { StrokeColor },
      colorPalette,
      t
    } = this.props;

    const color = StrokeColor?.toHexString();

    const isBorderSelected = colorPalette === ANNOTATION_STYLE.STROKE_COLOR;
    const isWhiteColor = color === '#FFFFFF';
    return (
      <Tooltip content={t('option.annotationColor.StrokeColor')}>
        <div
          role="button"
          tabIndex={0}
          className={classNames({
            border: true,
            selected: isBorderSelected,
          })}
          onClick={() => this.setActivePalette(ANNOTATION_STYLE.STROKE_COLOR)}
        >
          <Icomoon
            className="border"
            color={isWhiteColor && !isBorderSelected ? 'rgb(192, 208, 223)' : StrokeColor}
            size={18}
          />
        </div>
      </Tooltip>
    );
  };

  renderFillColorIcon = () => {
    const {
      style: { FillColor },
      colorPalette,
      t,
    } = this.props;

    const color = FillColor?.toHexString();

    const isFillColorSelected = colorPalette === ANNOTATION_STYLE.FILL_COLOR;
    const isWhiteColor = color === '#FFFFFF';

    return (
      <Tooltip content={t('option.annotationColor.FillColor')}>
        <div
          role="button"
          tabIndex={-1}
          className={classNames({
            fill: true,
            selected: isFillColorSelected,
          })}
          onClick={() => this.setActivePalette(ANNOTATION_STYLE.FILL_COLOR)}
        >
          <Icomoon
            className="rect-filled"
            color={isWhiteColor && !isFillColorSelected ? 'rgb(192, 208, 223, 0.6)' : color}
            size={18}
          />
        </div>
      </Tooltip>
    );
  };

  renderTitleHeader = () => {
    const { colorPalette, colorMapKey, t } = this.props;

    let title = t('documentPage.style');
    if (
      [PREMIUM_FEATURE_NAME[TOOLS_NAME.FREETEXT], annotationColorMapKey.DATE_FREE_TEXT].includes(colorMapKey)
    ) {
      if (colorPalette === ANNOTATION_STYLE.TEXT_COLOR) {
        title = t('documentPage.textStyle');
      }
      if (colorPalette === ANNOTATION_STYLE.STROKE_COLOR || colorPalette === ANNOTATION_STYLE.FILL_COLOR) {
        title = t('documentPage.textFrame');
      }
    }
    return <p>{title}</p>;
  };

  render() {
    const {
      colorPalette,
      colorMapKey,
      isTextColorPaletteDisabled,
      isBorderColorPaletteDisabled,
      isFillColorPaletteDisabled,
      isAnnotationStylePopup,
      annotation,
    } = this.props;
    const { availablePalettes } = getDataWithKey(colorMapKey);
    const isNotRedactionAnnotation = annotation && annotation.Subject !== AnnotationSubjectMapping.redact;

    const groupButtonShapeTool = ['line', 'arrow', 'polyline'];
    const shouldRenderTextColorIcon =
      availablePalettes?.includes(ANNOTATION_STYLE.TEXT_COLOR) &&
      !isTextColorPaletteDisabled &&
      isNotRedactionAnnotation;
    const shouldRenderBorderColorIcon =
      availablePalettes?.includes(ANNOTATION_STYLE.STROKE_COLOR) &&
      !isBorderColorPaletteDisabled &&
      isNotRedactionAnnotation;
    const shouldRenderFillColorIcon =
      availablePalettes?.includes(ANNOTATION_STYLE.FILL_COLOR) &&
      !isFillColorPaletteDisabled &&
      isNotRedactionAnnotation;

    if (
      availablePalettes?.length < 2 ||
      (!shouldRenderTextColorIcon && !shouldRenderBorderColorIcon && !shouldRenderFillColorIcon)
    ) {
      return (
        <div className="stylePopup-title">
          {groupButtonShapeTool.includes(colorMapKey) &&
          <div
            className={classNames({
              'palette--title': true,
              'palette--mg-0': colorPalette === ANNOTATION_STYLE.FILL_COLOR,
            })}
          >
            {this.renderTitleHeader()}
          </div>}
          {colorMapKey === 'freeHand' && <div
            className={classNames({
              'palette--mg-0': isAnnotationStylePopup,
            })}
          />}
        </div>
      );
    }
    return (
      <div className="stylePopup-title">
          <div
            className={classNames({
              'palette--title': true,
              'palette--mg-0': colorPalette === ANNOTATION_STYLE.FILL_COLOR,
            })}
          >
            {this.renderTitleHeader()}
            <div className="palette palette--mg-0 ColorPaletteHeader__palette--flex">
              {colorPalette !== ANNOTATION_STYLE.TEXT_COLOR && shouldRenderFillColorIcon &&
              this.renderFillColorIcon()}
              {colorPalette !== ANNOTATION_STYLE.TEXT_COLOR && shouldRenderBorderColorIcon &&
              this.renderBorderColorIcon()}
            </div>
          </div>
        </div>
    );
  }
}

ColorPaletteHeader.propTypes = {
  style: PropTypes.object.isRequired,
  colorPalette: PropTypes.oneOf(['TextColor', 'StrokeColor', 'FillColor']),
  colorMapKey: PropTypes.string.isRequired,
  setActivePalette: PropTypes.func.isRequired,
  isTextColorPaletteDisabled: PropTypes.bool,
  isFillColorPaletteDisabled: PropTypes.bool,
  annotation: PropTypes.object,
  isBorderColorPaletteDisabled: PropTypes.bool,
  isAnnotationStylePopup: PropTypes.bool,
  t: PropTypes.func,
};

ColorPaletteHeader.defaultProps = {
  colorPalette: 'TextColor',
  isTextColorPaletteDisabled: false,
  isFillColorPaletteDisabled: false,
  isBorderColorPaletteDisabled: false,
  annotation: {},
  isAnnotationStylePopup: false,
  t: () => {},
};

export default withTranslation()(ColorPaletteHeader);
