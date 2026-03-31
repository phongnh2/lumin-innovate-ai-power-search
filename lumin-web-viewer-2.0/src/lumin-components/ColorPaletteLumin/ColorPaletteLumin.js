import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import core from 'core';

import { isComment } from 'lumin-components/CommentPanel/helper';

import { colorParse } from 'utils';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { THEME_MODE } from 'constants/lumin-common';
import toolsName, { TOOLS_NAME } from 'constants/toolsName';

import ColorCell from './ColorCell';
import ColorPickerCell from './ColorPickerCell';
import TransparencyCell from './TransparencyCell';
import * as Styled from './V2/ColorPaletteLumin.styled';

import './ColorPaletteLumin.scss';

const WHITE_COLOR = 'rgb(255, 255, 255)';

const propTypes = {
  property: PropTypes.string.isRequired,
  color: PropTypes.object,
  onStyleChange: PropTypes.func.isRequired,
  colorMapKey: PropTypes.string.isRequired,
  overridePalette: PropTypes.object,
  annotation: PropTypes.object,
  placement: PropTypes.string,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  hideNoColor: PropTypes.bool,
  isOpenRightToolPanel: PropTypes.bool,
  className: PropTypes.string,
  /**
   * @description new layout prop
   */
  anchorFreeTextTool: PropTypes.object,
  onOpenFreeTextToolChromePicker: PropTypes.func,
  onCompletedFreeTextToolChromePicker: PropTypes.func,
  isToolbarPopoverOpened: PropTypes.bool,
};

const defaultProps = {
  overridePalette: null,
  color: {},
  annotation: {},
  placement: 'bottom',
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  hideNoColor: false,
  isOpenRightToolPanel: false,
  className: '',
  anchorFreeTextTool: null,
  onOpenFreeTextToolChromePicker: () => {},
  onCompletedFreeTextToolChromePicker: () => {},
  isToolbarPopoverOpened: false,
};
class ColorPaletteLumin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      palette: [],
    };
    this.setPalette = this.setPalette.bind(this);
  }

  componentDidMount() {
    const { overridePalette, colorMapKey, color } = this.props;
    // eslint-disable-next-line prefer-const
    let palette = overridePalette?.[colorMapKey] || overridePalette?.global || this.defaultPalette;
    const currentColor = `rgb(${color.R}, ${color.G}, ${color.B})`;
    if (!palette.includes(currentColor)) {
      // eslint-disable-next-line no-magic-numbers
      const paletteLength = palette.length ?? 0;
      palette?.splice(paletteLength - 1, 1, currentColor);
    }
    this.setState({ palette });
  }

  // eslint-disable-next-line react/sort-comp
  defaultPalette = (() => {
    // Freetext Tool && Shape Tool
    const colors = [
      'rgb(16, 45, 66)', // #102d42
      'rgb(215, 48, 39)', // #D73027
      'rgb(69, 117, 180)', // #4575B4
      'rgb(90, 180, 172)', // #5AB4AC
      'rgb(254, 224, 144)', // #FEE090
      'rgb(224, 243, 248)', // #E0F3F8
      WHITE_COLOR, // #FFFFFF
    ];

    // Comment Tool
    if (this.props.colorMapKey === 'stickyNote') {
      return [
        'rgb(3, 89, 112)', // 035970
        'rgb(69, 117, 180)', // 4575B4
        'rgb(90, 180, 172)', // 5AB4AC
        'rgb(127, 191, 123)', // 7FBF7B
        'rgb(215, 48, 39)', // D73027
        'rgb(253, 174, 107)', // FDAE6B
        'rgb(175, 141, 195)', // AF8DC3
      ];
    }

    // rubberStampText
    if (this.props.colorMapKey === annotationColorMapKey.RUBBER_STAMP.TEXT) {
      return [
        WHITE_COLOR,
        'rgb(0, 0, 0)',
        'rgb(161, 34, 20)',
        'rgb(218, 141, 25)',
        'rgb(71, 119, 27)',
        'rgb(37, 80, 163)',
        'rgb(30, 40, 123)',
      ];
    }

    // rubberStamBg
    if (this.props.colorMapKey === annotationColorMapKey.RUBBER_STAMP.BG) {
      return [
        'rgb(98, 151, 105)',
        'rgb(195, 63, 63)',
        'rgb(35, 52, 138)',
        'rgb(213, 147, 48)',
        'rgb(226, 237, 250)',
        'rgb(229, 245, 222)',
        WHITE_COLOR,
      ];
    }

    // Redaction Tool ........

    const removeWhiteColor =
      (core.getSelectedAnnotations().length && core.getSelectedAnnotations().some(isComment)) ||
      core.getToolMode()?.name === 'AnnotationCreateSticky';
    if (removeWhiteColor) {
      // eslint-disable-next-line no-magic-numbers
      colors.splice(7, 1);
    }
    if (
      (core.getSelectedAnnotations().length && core.getToolMode()?.name === toolsName.REDACTION) ||
      this.props.colorMapKey === annotationColorMapKey.REDACTION
    ) {
      // eslint-disable-next-line no-magic-numbers
      colors.splice(7, 1);
    }

    return colors;
  })();

  setColor = (e) => {
    e.stopPropagation();
    const { property, onStyleChange } = this.props;
    const bg = e.currentTarget.value; // rgb(r, g, b);
    // eslint-disable-next-line no-magic-numbers
    const rgba = bg ? bg.slice(bg.indexOf('(') + 1, -1).split(',') : [0, 0, 0, 0];
    const finalColor = new window.Core.Annotations.Color(rgba[0], rgba[1], rgba[2], rgba[3]);
    onStyleChange(property, finalColor);
  };

  setPalette = (palette) => {
    const { property, onStyleChange } = this.props;
    if (this.state.palette.includes(palette)) return;
    // eslint-disable-next-line no-magic-numbers
    const slicePosition = this.state.palette[0] === 'transparency' ? 1 : 0;
    const newPalette = [...this.state.palette];
    newPalette?.splice(slicePosition, 1);
    this.setState({ palette: [...newPalette, palette] });
    // eslint-disable-next-line no-magic-numbers
    const rgba = palette ? palette.slice(palette.indexOf('(') + 1, -1).split(',') : [0, 0, 0, 0];
    const finalColor = new window.Core.Annotations.Color(rgba[0], rgba[1], rgba[2], rgba[3]);
    onStyleChange(property, finalColor);
  };

  renderActiveClass = (bg) => {
    const { color } = this.props;

    const selectedColor = colorParse.rbgToHex(bg) || 'transparency';
    const currentColor = (color && typeof color.toHexString === 'function' && color.toHexString()) || 'transparency';
    const isColorPicked = currentColor.toLowerCase() === selectedColor;
    if (!isColorPicked) {
      return '';
    }
    return 'active';
  };

  render() {
    const { palette } = this.state;
    const {
      annotation,
      placement,
      colorMapKey,
      property,
      themeMode,
      hideNoColor,
      isOpenRightToolPanel,
      anchorFreeTextTool,
      onOpenFreeTextToolChromePicker,
      onCompletedFreeTextToolChromePicker,
      className: classNameProp,
      isToolbarPopoverOpened,
    } = this.props;

    const isNotRenderTransparencyCell =
      hideNoColor ||
      (annotation && annotation.Subject === AnnotationSubjectMapping.redact) ||
      colorMapKey === annotationColorMapKey.RUBBER_STAMP.TEXT ||
      colorMapKey === annotationColorMapKey.RUBBER_STAMP.BG;
    const isTextFieldPalette = colorMapKey === annotationColorMapKey.TEXT_FIELD;
    const isContentEditPalette = colorMapKey === annotationColorMapKey.CONTENT_EDIT;

    const containerClassName = classNames([
      classNameProp,
    ]);

    return (
      <>
        <TransparencyCell
          setColor={this.setColor}
          property={property}
          active={this.renderActiveClass('transparency')}
          className="color-cell"
          isNotRenderTransparencyCell={isNotRenderTransparencyCell}
          themeMode={themeMode}
          isTextFieldPalette={isTextFieldPalette}
        />
        <Styled.ColorPaletteContainer
          data-new-layout
          className={containerClassName}
          data-element="colorPalette"
        >
          {palette.map((bg) => (
            <React.Fragment key={bg}>
              <ColorCell
                active={this.renderActiveClass(bg) === 'active'}
                bg={bg}
                onClick={this.setColor}
                className="color-cell"
              />
            </React.Fragment>
          ))}
          <ColorPickerCell
            setPalette={this.setPalette}
            placement={placement}
            isContentEditPalette={isContentEditPalette}
            isOpenRightToolPanel={isOpenRightToolPanel}
            initialColor={this.props.color}
            textToolAnchorRef={anchorFreeTextTool}
            onOpenFreeTextToolChromePicker={onOpenFreeTextToolChromePicker}
            onCompletedFreeTextToolChromePicker={onCompletedFreeTextToolChromePicker}
            isToolbarPopoverOpened={isToolbarPopoverOpened}
          />
        </Styled.ColorPaletteContainer>
      </>
    );
  }
}

ColorPaletteLumin.propTypes = propTypes;
ColorPaletteLumin.defaultProps = defaultProps;

export default withValidUserCheck(ColorPaletteLumin, TOOLS_NAME.STICKY);
