import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import StylePalette from 'luminComponents/StylePalette';

import { isMobile } from 'helpers/device';
import getAnnotationStyles from 'helpers/getAnnotationStyles';
import getClassName from 'helpers/getClassName';
import resizeFreetextToFitContent from 'helpers/resizeFreetextToFitContent';
import setToolStyles from 'helpers/setToolStyles';

import { DataElements } from 'constants/dataElement';
import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { mapAnnotationToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';
import './AnnotationStylePopup.scss';

const defaultProps = {
  isDisabled: false,
  placement: 'bottom',
};

const propTypes = {
  isDisabled: PropTypes.bool,
  annotation: PropTypes.object.isRequired,
  closeElement: PropTypes.func.isRequired,
  placement: PropTypes.string,
  activeToolName: PropTypes.string.isRequired,
};

class AnnotationStylePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: getAnnotationStyles(this.props.annotation),
    };
  }

  handleStyleChange = (property, value) => {
    const { annotation } = this.props;

    core.setAnnotationStyles(annotation, {
      [property]: value,
    });
    this.setState({ style: getAnnotationStyles(annotation) });

    const { FONT_STYLE, FONT_SIZE } = ANNOTATION_STYLE;

    if (property === FONT_SIZE) {
      core.getAnnotationManager().redrawAnnotation(annotation);
      resizeFreetextToFitContent(annotation);
    }

    if (
      property !== FONT_STYLE &&
      ![TOOLS_NAME.SIGNATURE, TOOLS_NAME.STAMP, TOOLS_NAME.RUBBER_STAMP].includes(annotation.ToolName)
    ) {
      setToolStyles(annotation.ToolName, property, value);
    }
  };

  handleClick = (e) => {
    // see the comments above handleClick in ToolStylePopup.js
    if (isMobile() && e.target === e.currentTarget) {
      this.props.closeElement('annotationPopup');
    }
  };

  render() {
    const { isDisabled, annotation, placement, activeToolName } = this.props;
    const { style } = this.state;

    const isFreeText =
      annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
      annotation.getIntent() === window.Core.Annotations.FreeTextAnnotation.Intent.FreeText;
    const isSignature =
      annotation.Subject === 'Signature' && annotation instanceof window.Core.Annotations.StampAnnotation;
    const className = getClassName('Popup AnnotationStylePopup', this.props);
    const hideDivider = annotation instanceof window.Core.Annotations.StampAnnotation;

    const colorMapKey = mapAnnotationToKey(annotation);
    if (isDisabled) {
      return null;
    }

    return (
      <div
        className={className}
        role="button"
        tabIndex={0}
        data-element={DataElements.ANNOTATION_STYLE_POPUP}
        onClick={this.handleClick}
      >
        <StylePalette
          key={activeToolName}
          colorMapKey={colorMapKey}
          style={style}
          isFreeText={isFreeText}
          isSignature={isSignature}
          annotation={annotation}
          onStyleChange={this.handleStyleChange}
          hideDivider={hideDivider}
          isAnnotationStylePopup
          placement={placement}
        />
      </div>
    );
  }
}

AnnotationStylePopup.propTypes = propTypes;
AnnotationStylePopup.defaultProps = defaultProps;

export default AnnotationStylePopup;
