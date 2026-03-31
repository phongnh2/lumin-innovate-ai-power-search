/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable react/no-unused-state */
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import MaterialPopper from 'lumin-components/MaterialPopper';
import ToolButton from 'lumin-components/ToolButton';
import ToolStylePalette from 'lumin-components/ToolStylePalette';

import { isDesktop, isTablet } from 'helpers/device';

import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';

import HighlightToolsOverlay from './components/HighlightToolsOverlay';

import './ToolsOverlayLumin.scss';

const propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  toolButtonObjects: PropTypes.object.isRequired,
  activeHeaderItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeToolGroup: PropTypes.string.isRequired,
  closeElements: PropTypes.func.isRequired,
  setActiveToolGroup: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  t: PropTypes.func,
};

const defaultProps = {
  isDisabled: false,
  isOpen: false,
  t: () => {},
};
const RESIZE_DEBOUNCE_TIME = 50;
class ToolsOverlayLumin extends React.PureComponent {
  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {
      openStyle: false,
      anchorEl: null,
    };
    this.debounceHandleResize = debounce(this.getAnchorEl, RESIZE_DEBOUNCE_TIME);
  }

  componentDidMount() {
    window.addEventListener('resize', this.debounceHandleResize);

    // this component can be opened before mounting to the DOM if users call the setToolMode API
    // in this case we need to set its position immediately after it's mounted
    // otherwise its left is 0 instead of left-aligned with the tool group button
    // if (this.props.isOpen) {
    //   this.setOverlayPosition();
    // }
    this.getAnchorEl();
  }

  componentDidUpdate(prevProps) {
    const clickedOnAnotherToolGroupButton = prevProps.activeToolGroup !== this.props.activeToolGroup;

    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements([
        DataElements.VIEW_CONTROLS_OVERLAY,
        DataElements.MENU_OVERLAY,
        DataElements.TOOL_STYLE_POPUP,
        DataElements.SIGNATURE_OVERLAY,
        DataElements.ZOOM_OVERLAY,
        DataElements.REDACTION_OVERLAY,
        DataElements.RUBBER_STAMP_MODAL,
        DataElements.RUBBER_STAMP_OVERLAY,
      ]);
      this.getAnchorEl();
    }

    if (clickedOnAnotherToolGroupButton) {
      this.getAnchorEl();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debounceHandleResize);
  }

  getAnchorEl = () => {
    const { activeToolGroup, activeHeaderItems } = this.props;
    const element = activeHeaderItems.find((item) => item.toolGroup === activeToolGroup);
    if (element) {
      const dataElement =
        element?.isRenderOnTablet && isTablet() ? `${element.dataElement}-tablet` : element.dataElement;
      const anchorEl = document.querySelector(`[data-element=${dataElement}]`);
      this.setState({ anchorEl, activeElement: element, openStyle: false });
    }
  };

  // Do not delete to resolve Unused method error
  handleClickOutside = (e) => {
    const toolStylePopup = document.querySelector(`[data-element="${DataElements.TOOL_STYLE_POPUP}"]`);
    const header = document.querySelector('[data-element="header"]');
    const clickedToolStylePopup = toolStylePopup && toolStylePopup.contains(e.target);
    const clickedHeader = header && header.contains(e.target);

    if (isDesktop() && !clickedToolStylePopup && !clickedHeader) {
      this.props.closeElements([DataElements.TOOLS_OVERLAY]);
    }
  };

  handleCloseClick = () => {
    const { setActiveToolGroup, closeElements } = this.props;

    core.setToolMode(defaultTool);
    setActiveToolGroup('');
    closeElements([DataElements.TOOL_STYLE_POPUP, DataElements.TOOLS_OVERLAY]);
  };

  openStylePalette = (e) => {
    e.stopPropagation();
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ openStyle: !this.state.openStyle });
  };

  renderContent = () => {
    const { toolButtonObjects, activeToolGroup, t } = this.props;

    const toolNames = Object.keys(toolButtonObjects).filter(
      (toolName) => toolButtonObjects[toolName].group === activeToolGroup
    );
    if (activeToolGroup !== 'highlightTools') {
      return (
        <div className="ToolsOverlayLumin" data-element={DataElements.TOOLS_OVERLAY}>
          {activeToolGroup !== 'freeHandTools' && (
            <>
              <div className="ToolsOverlayLumin__tools-container">
                <div className="ToolsOverlayLumin__label">
                  {activeToolGroup === 'shapeTools' ? t('documentPage.shape') : t('documentPage.chooseStyle')}
                </div>
                <div className="spacer hide-in-desktop" />
                <div
                  className={`ToolsOverlayLumin__tools ${
                    activeToolGroup === 'textTools' ? 'ToolsOverlayLumin__tools--flex-end' : ''
                  }`}
                >
                  {toolNames.map((toolName, i) => (
                    <ToolButton key={`${toolName}-${i}`} toolName={toolName} className="square" />
                  ))}
                </div>
              </div>
              <div className="divider horizontal" />
            </>
          )}
          <ToolStylePalette />
        </div>
      );
    }
    return <HighlightToolsOverlay />;
  };

  render() {
    const { anchorEl } = this.state;
    const { isDisabled, isOpen, activeToolGroup, closeElement } = this.props;
    if (isDisabled || !activeToolGroup || isOpen === undefined || !anchorEl) {
      return null;
    }
    return (
      <MaterialPopper
        open={isOpen}
        anchorEl={anchorEl}
        classes="ToolStylePopupLumin__Popper"
        handleClose={(e) => {
          if (anchorEl.contains(e.target)) return;
          closeElement('toolsOverlay');
        }}
        hasDropDownList
      >
        {this.renderContent()}
      </MaterialPopper>
    );
  }
}

ToolsOverlayLumin.propTypes = propTypes;
ToolsOverlayLumin.defaultProps = defaultProps;
// cannot use handle clickoutside when use withTranslation()
export default ToolsOverlayLumin;
