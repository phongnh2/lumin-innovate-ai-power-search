import React from 'react';
import PropTypes from 'prop-types';

import core from 'core';

import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import { zoomTo } from 'helpers/zoom';

import OverlayItem from '../OverlayItem';
import ToolButton from '../ToolButton';

import './ZoomOverlay.scss';

class ZoomOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    closeElements: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    zoomList: PropTypes.arrayOf(PropTypes.number)
  }

  constructor(props) {
    super(props);
    this.dropdown = React.createRef();
    this.state = {
      left: 0,
      right: 'auto'
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['viewControlsOverlay', 'toolsOverlay', 'menuOverlay', 'toolStylePopup']);
      const { left, right } = getOverlayPositionBasedOn('zoomOverlayButton', this.dropdown);
      this.setState({
        left: left - 20,
        right
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleClickOutside = e => {
    const ToggleZoomButton = document.querySelector('[data-element="zoomOverlayButton"]');
    const clickedToggleZoomButton = ToggleZoomButton && ToggleZoomButton.contains(e.target);

    if (!clickedToggleZoomButton) {
      this.props.closeElements('zoomOverlay');
    }
  };

  handleWindowResize = () => {
    const { left, right } = getOverlayPositionBasedOn('zoomOverlayButton', this.dropdown);
    this.setState({
      left: left - 20,
      right
    });
  }

  render() {
    const { isOpen, isDisabled, t, closeElements, zoomList } = this.props;
    const className = [
      'ZoomOverlay',
      isOpen ? 'open' : 'closed'
    ].join(' ').trim();
    const { left, right } = this.state;

    if (isDisabled) {
      return null;
    }

    return (
      <div className={className} data-element="zoomOverlay" style={{ left, right }} ref={this.dropdown}>
        <OverlayItem onClick={core.fitToWidth} buttonName={t('action.fitToWidth')} />
        <OverlayItem onClick={core.fitToPage} buttonName={t('action.fitToPage')} />
        <div className="spacer" />
        {zoomList.map((zoomValue, i) => (
          <OverlayItem key={i}
            onClick={() => zoomTo(zoomValue)}
            buttonName={`${zoomValue * 100}%`}
          />
        ))}
        <div className="spacer" />
        {/* <ToolButton toolName="MarqueeZoomTool" label={t('tool.Marquee')} onClick={() => closeElements(['zoomOverlay'])} /> */}
      </div>
    );
  }
}

export default ZoomOverlay;


