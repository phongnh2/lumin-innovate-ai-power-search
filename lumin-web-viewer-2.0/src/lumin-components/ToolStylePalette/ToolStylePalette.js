/* eslint-disable react/no-unused-state */
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import { mapToolNameToKey } from 'constants/map';

import StylePalette from '../StylePalette';

class ToolStylePalette extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      left: 0,
      top: 0,
      prevActivateTool: props.activeToolName,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  static getDerivedStateFromProps(props) {
    return {
      prevActivateTool: props.activeToolName,
    };
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.props.closeElement('toolStylePopup');
  };

  handleStyleChange = (property, value) => {
    const toolName = this.props.activeToolName;

    core.getTool(toolName).setStyles({
      [property]: value,
    });
  };

  render() {
    const { activeToolName, activeToolStyle, hideThicknessSlider } = this.props;
    const isFreeText = activeToolName === 'AnnotationCreateFreeText';
    const colorMapKey = mapToolNameToKey(activeToolName);
    const hideDivider = activeToolName === 'AnnotationCreateTextHighlight';
    const hideOpacitySlider = activeToolName === 'AnnotationCreateSignature';
    return (
      <StylePalette
        key={activeToolName}
        colorMapKey={colorMapKey}
        style={activeToolStyle}
        isFreeText={isFreeText}
        hideDivider={hideDivider}
        onStyleChange={this.handleStyleChange}
        hideOpacitySlider={hideOpacitySlider}
        hideThicknessSlider={hideThicknessSlider}
      />
    );
  }
}

ToolStylePalette.propTypes = {
  activeToolName: PropTypes.string.isRequired,
  activeToolStyle: PropTypes.object.isRequired,
  closeElement: PropTypes.func,
  hideThicknessSlider: PropTypes.bool,
};

ToolStylePalette.defaultProps = {
  closeElement: () => {},
  hideThicknessSlider: false,
};

export default ToolStylePalette;
