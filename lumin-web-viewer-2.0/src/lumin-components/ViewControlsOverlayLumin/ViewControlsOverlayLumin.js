import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import MaterialPopper from 'luminComponents/MaterialPopper';

import displayModeObjects from 'constants/displayModeObjects';

import './ViewControlsOverlayLumin.scss';

const propTypes = {
  displayMode: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElements: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
};

const defaultProps = {
  isDisabled: false,
  isOpen: false,
};

class ViewControlsOverlayLumin extends React.PureComponent {
  overlay = React.createRef();

  state = {
    left: 0,
    right: 'auto',
    anchorEl: null,
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements([
        'toolsOverlay',
        'menuOverlay',
        'toolsOverlay',
        'toolStylePopup',
        'signatureOverlay',
        'zoomOverlay',
        'redactionOverlay',
      ]);
      // this.setState(getOverlayPositionBasedOn('viewControlsButton', this.overlay));
      this.getAnchorEl();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  getAnchorEl = () => {
    const anchorEl = document.querySelector(
      '[data-element=viewControlsButton]',
    );
    this.setState({ anchorEl });
  };

  handleWindowResize = () => {
    // this.setState(getOverlayPositionBasedOn('viewControlsButton', this.overlay));
    this.getAnchorEl();
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  handleClickOutside = (e) => {
    const clickedViewControlsButton =
      e.target.getAttribute('data-element') === 'viewControlsButton';

    if (!clickedViewControlsButton) {
      this.props.closeElements(['viewControlsOverlay']);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  handleClick = (pageTransition, layout) => {
    const displayModeObject = displayModeObjects.find(
      (obj) => obj.pageTransition === pageTransition && obj.layout === layout,
    );

    core.setDisplayMode(displayModeObject.displayMode);
  };

  render() {
    const {
      isDisabled,
      displayMode,
      t,
      isOpen,
      closeElement,
    } = this.props;
    const { left, right, anchorEl } = this.state;
    const { pageTransition, layout } = displayModeObjects.find(
      (obj) => obj.displayMode === displayMode,
    );
    const className = classNames('ViewControlsOverlayLumin', {
      open: isOpen,
      closed: !isOpen,
    });

    if (isDisabled || isOpen === undefined || !anchorEl) {
      return null;
    }

    const handleClose = (e) => {
      if (anchorEl.contains(e.target)) return;
      closeElement('viewControlsOverlay');
    };

    return (
      <MaterialPopper
        open={isOpen}
        anchorEl={anchorEl}
        handleClose={handleClose}
        classes="ViewControlsOverlayLumin__MaterialPopper"
      >
        <div
          className={className}
          data-element="viewControlsOverlay"
          style={{ left, right }}
          ref={this.overlay}
        >
          <div className="ViewControlsOverlayLumin__container ViewControlsOverlayLumin__container--has-margin">
            <div className="ViewControlsOverlayLumin__title--wrapper">
              <div className="title">
                {t('option.displayMode.pageTransition')}
              </div>
            </div>
            <div className="ViewControlsOverlayLumin__button--wrapper">
              <Button
                className="ViewControlsOverlayLumin__button"
                dataElement="defaultPageTransitionButton"
                title="option.pageTransition.default"
                icon="single-page-view"
                onClick={() => this.handleClick('default', layout)}
                isActive={pageTransition === 'default'}
              />
              <Button
                className="ViewControlsOverlayLumin__button"
                dataElement="continuousPageTransitionButton"
                title="option.pageTransition.continuous"
                icon="mode-continuous"
                onClick={() => this.handleClick('continuous', layout)}
                isActive={pageTransition === 'continuous'}
              />
            </div>
          </div>

          <div className="ViewControlsOverlayLumin__container">
            <div className="ViewControlsOverlayLumin__title--wrapper">
              <div className="title">{t('option.displayMode.layout')}</div>
            </div>
            <div className="ViewControlsOverlayLumin__button--wrapper">
              <Button
                className="ViewControlsOverlayLumin__button"
                dataElement="singleLayoutButton"
                title="option.layout.single"
                icon="one-page-view"
                onClick={() => this.handleClick(pageTransition, 'single')}
                isActive={layout === 'single'}
              />
              <Button
                className="ViewControlsOverlayLumin__button"
                dataElement="doubleLayoutButton"
                title="option.layout.double"
                icon="two-page-view"
                iconSize={20}
                onClick={() => this.handleClick(pageTransition, 'double')}
                isActive={layout === 'double'}
              />
              <Button
                className="ViewControlsOverlayLumin__button ViewControlsOverlayLumin__button--no-margin"
                dataElement="coverLayoutButton"
                title="option.layout.cover"
                icon="cover-view"
                iconSize={20}
                onClick={() => this.handleClick(pageTransition, 'cover')}
                isActive={layout === 'cover'}
              />
            </div>
          </div>
        </div>
      </MaterialPopper>
    );
  }
}

ViewControlsOverlayLumin.propTypes = propTypes;
ViewControlsOverlayLumin.defaultProps = defaultProps;

export default ViewControlsOverlayLumin;
