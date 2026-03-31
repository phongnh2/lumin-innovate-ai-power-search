import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import MaterialPopper from 'lumin-components/MaterialPopper';
import StylePalette from 'luminComponents/StylePalette';

import { isTablet } from 'helpers/device';

import { mapToolNameToKey } from 'constants/map';
import TOOLS_NAME from 'constants/toolsName';

const RESIZE_DEBOUNCE_TIME = 50;
class ToolStylePopupLumin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.debounceHandleResize = debounce(this.getAnchorEl, RESIZE_DEBOUNCE_TIME);
  }

  componentDidMount() {
    window.addEventListener('resize', this.debounceHandleResize);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen && !this.props.isDisabled) {
      this.props.closeElements([
        'viewControlsOverlay',
        'menuOverlay',
        'signatureOverlay',
        'zoomOverlay',
        'redactionOverlay',
        'toolsOverlay',
      ]);
      this.getAnchorEl();
    }

    const selectedAnotherTool = prevProps.activeToolName !== this.props.activeToolName;
    if (selectedAnotherTool && !this.props.isDisabled && this.props.activeToolName !== 'AnnotationEdit') {
      this.getAnchorEl();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debounceHandleResize);
  }

  getAnchorEl = () => {
    const { activeToolName, activeHeaderItems } = this.props;
    const selectedTool = activeHeaderItems.find((item) => item.toolName === activeToolName);
    if (selectedTool) {
      const dataElement =
        selectedTool?.isRenderOnTablet && isTablet() ? `${selectedTool.dataElement}-tablet` : selectedTool.dataElement;
      const anchorEl = document.querySelector(`[data-element=${dataElement}]`);
      this.setState({ anchorEl });
    }
  };

  handleStyleChange = (property, value) => {
    const { activeToolName } = this.props;

    core.getTool(activeToolName).setStyles({
      [property]: value,
    });
  };

  render() {
    const { anchorEl } = this.state;
    const { isDisabled, activeToolName, activeToolStyle, isOpen, closeElement } = this.props;
    const isFreeText = activeToolName === 'AnnotationCreateFreeText';
    const colorMapKey = mapToolNameToKey(activeToolName);
    const hideDivider = activeToolName === 'AnnotationCreateStamp';

    const hideOpacitySlider = activeToolName === TOOLS_NAME.STICKY;
    if (isDisabled || isOpen === undefined || !anchorEl) {
      return null;
    }

    return (
      <MaterialPopper
        open={isOpen}
        anchorEl={anchorEl}
        classes="ToolStylePopupLumin__Popper"
        handleClose={(e) => {
          if (anchorEl.contains(e.target)) return;
          closeElement('toolStylePopup');
        }}
        hasDropDownList
      >
        <div className="ToolStylePopupLumin" data-element="annotationPopup">
          <StylePalette
            key={activeToolName}
            colorMapKey={colorMapKey}
            style={activeToolStyle}
            isFreeText={isFreeText}
            hideDivider={hideDivider}
            onStyleChange={this.handleStyleChange}
            hideOpacitySlider={hideOpacitySlider}
            activeToolName={activeToolName}
          />
        </div>
      </MaterialPopper>
    );
  }
}

ToolStylePopupLumin.propTypes = {
  activeToolName: PropTypes.string,
  activeToolStyle: PropTypes.object,
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  activeHeaderItems: PropTypes.array.isRequired,
};

ToolStylePopupLumin.defaultProps = {
  activeToolName: '',
  activeToolStyle: {},
  isDisabled: false,
  isOpen: false,
};

export default ToolStylePopupLumin;
