/* eslint-disable class-methods-use-this */
import MenuList from '@mui/material/MenuList';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { ZOOM_MODE as ZOOM_MODE_LIST } from '@new-ui/components/LuminToolbar/tools-components/ZoomTool/constants';

import core from 'core';

import MenuItem from 'lumin-components/Shared/MenuItem';
import PopperButton from 'luminComponents/PopperButton';

import { isMac } from 'helpers/device';
import { zoomOut, zoomIn, fitToHeight, fitToWidth } from 'helpers/zoom';

import './ZoomButton.scss';

import { toastUtils, eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

const ZOOM_MODE = ZOOM_MODE_LIST.map((zoomItem) => `${zoomItem}%`);

const MIN_ZOOM_THRESHOLD = ZOOM_THRESHOLD.MIN;
const MAX_ZOOM_THRESHOLD = ZOOM_THRESHOLD.MAX;

const propTypes = {
  zoomRatio: PropTypes.number,
  t: PropTypes.func,
};

const defaultProps = {
  zoomRatio: 0,
  t: () => {},
};

class ZoomButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      zoomRatio: '50%',
      showInput: false,
      isPopperOpen: false,
    };
    this.zoomValueInputRef = React.createRef();
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.setDefaultZoom();
    core.addEventListener('documentLoaded', this.onDocumentLoaded);
    core.addEventListener('zoomUpdated', this.onZoomUpdated);
  }

  componentWillUnmount() {
    core.removeEventListener('documentLoaded', this.onDocumentLoaded);
    core.removeEventListener('zoomUpdated', this.onZoomUpdated);
  }

  onDocumentLoaded = () => {
    this.setDefaultZoom();
  };

  onZoomUpdated = () => {
    this.setDefaultZoom();
  };

  setDefaultZoom = () => {
    this.setState({
      zoomRatio: `${(core.getZoom() * 100).toFixed(0).toString()}%`,
    });
  };

  handleChangeZoomRatio = (value, callback) => {
    const parseRatio = value.split('%')[0] / 100;
    const zoomRatio = value ? this.convertRatioToString(value) : `${this.props.zoomRatio * 100}%`;
    this.setState({ zoomRatio, showInput: false }, () => callback());
    core.setZoomLevel(parseRatio);
  };

  convertRatioToString = (value) => {
    if (value.includes('%')) {
      return value;
    }
    return `${value}%`;
  };

  handlePressEnter = (e, callback) => {
    if (e.which !== 13) {
      return;
    }
    this.handleSubmitZoomRatio(callback);
  };

  handleSubmitZoomRatio = (callback = () => {}) => {
    const { zoomRatio } = this.state;
    const { t } = this.props;
    const zoomValue = Number(zoomRatio.split('%')[0]);

    if (zoomValue < MIN_ZOOM_THRESHOLD || zoomValue > MAX_ZOOM_THRESHOLD) {
      const toastSettings = {
        message: t('viewer.zoomButton.toastMessage', {
          minZoomThreshold: MIN_ZOOM_THRESHOLD,
          maxZoomThreshold: MAX_ZOOM_THRESHOLD,
        }),
      };
      const zoomValueHasValidated = `${zoomValue < MIN_ZOOM_THRESHOLD ? MIN_ZOOM_THRESHOLD : MAX_ZOOM_THRESHOLD}%`;
      this.setState({
        zoomRatio: zoomValueHasValidated,
      });
      this.handleChangeZoomRatio(zoomValueHasValidated, callback);
      toastUtils.error(toastSettings);
    } else {
      this.handleChangeZoomRatio(zoomRatio, callback);
    }
  };

  isInputValid = (e) => {
    // eslint-disable-next-line sonarjs/prefer-single-boolean-return
    if (Number(e.target.value) || e.target.value === '') {
      return true;
    }
    return false;
  };

  handleChangeZoomValue = (e) => {
    if (!this.isInputValid(e)) {
      return;
    }
    this.setState({ zoomRatio: e.target.value });
  };

  handleShowInput = () => {
    this.setState(
      ({ showInput }) => ({ showInput: !showInput }),
      () => {
        if (this.state.showInput) {
          this.zoomValueInputRef.current?.focus();
        }
      }
    );
  };

  handleBlurZoomInput = (e, callback) => {
    if (!this.containerRef.current.contains(e.relatedTarget)) {
      this.setState(
        {
          showInput: false,
        },
        () => {
          callback();
          this.handleSubmitZoomRatio();
        }
      );
    }
  };

  closeInput = (...args) => {
    this.setState(
      {
        showInput: false,
      },
      () => {
        args.forEach((callback) => {
          callback();
        });
      }
    );
  };

  handleEventTracking = () => {
    eventTracking(UserEventConstants.EventType.HEADER_BUTTON, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.ZOOM,
    });
  };

  openPopper = () => {
    this.setState({
      isPopperOpen: true,
    });
  };

  closePopper = () => {
    this.setState({
      isPopperOpen: false,
    });
  };

  getContainerClass = () => {
    const { showInput, isPopperOpen } = this.state;
    return classNames('ZoomButton', {
      'ZoomButton--not-editable': !showInput && isPopperOpen,
      'ZoomButton--editable': showInput && isPopperOpen,
    });
  };

  render() {
    const { showInput, zoomRatio } = this.state;
    const { t } = this.props;
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className={this.getContainerClass()} ref={this.containerRef} onClick={this.handleClick}>
        <PopperButton
          classes="hide-in-mobile"
          ButtonComponent="div"
          renderPopperContent={({ closePopper }) => (
            <MenuList className="ZoomButton__popper" disablePadding>
              <MenuItem onClick={() => this.closeInput(fitToWidth, closePopper)}>
                {t('viewer.zoomButton.fitWidth')}
              </MenuItem>
              <MenuItem onClick={() => this.closeInput(fitToHeight, closePopper)}>
                <div>{t('viewer.zoomButton.fitHeight')}</div>
                <div className="shortcut">{isMac ? 'Cmd 0' : 'Ctrl 0'}</div>
              </MenuItem>
              <div className="ZoomButton__popper__divider" />
              {ZOOM_MODE.map((mode) => (
                <MenuItem
                  key={mode}
                  onClick={() => {
                    this.handleChangeZoomRatio(mode, closePopper);
                  }}
                >
                  {mode}
                </MenuItem>
              ))}
              <div className="ZoomButton__popper__divider" />
              <MenuItem onClick={zoomIn}>
                <div>{t('viewer.zoomButton.zoomIn')}</div>
                <div className="shortcut">{isMac ? 'Cmd +' : 'Ctrl +'}</div>
              </MenuItem>
              <MenuItem onClick={zoomOut}>
                <div>{t('viewer.zoomButton.zoomOut')}</div>
                <div className="shortcut">{isMac ? 'Cmd -' : 'Ctrl -'}</div>
              </MenuItem>
            </MenuList>
          )}
          {...{ zoomRatio, showInput }}
          useInput
          handleShowInput={this.handleShowInput}
          handleChangeZoomRatio={this.handleChangeZoomRatio}
          handleChangeZoomValue={this.handleChangeZoomValue}
          handlePressEnter={this.handlePressEnter}
          onBlurZoomInput={this.handleBlurZoomInput}
          onOpen={this.openPopper}
          onClose={this.closePopper}
          onClickZoomInput={this.closeInput}
          inputRef={this.zoomValueInputRef}
          eventTracking={this.handleEventTracking}
        />
      </div>
    );
  }
}

ZoomButton.propTypes = propTypes;
ZoomButton.defaultProps = defaultProps;

export default withTranslation()(ZoomButton);
