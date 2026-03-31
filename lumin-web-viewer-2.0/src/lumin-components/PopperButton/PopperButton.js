import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import { isObject, isString } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import SharedTooltip from 'luminComponents/Shared/Tooltip';
import Tooltip from 'luminComponents/Tooltip';

import { Colors } from 'constants/styles';

import MaterialPopper from '../MaterialPopper';

const CustomButton = withStyles({
  root: ({ disabled, rootStyle }) => ({
    borderRadius: 'var(--border-radius-primary)',
    '&:hover': {
      backgroundColor: Colors.NEUTRAL_10,
    },
    ...disabled && {
      '&.Mui-disabled': {
        color: Colors.WHITE,
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
    },
    ...rootStyle,
  }),
})(Button);

const propTypes = {
  ButtonComponent: PropTypes.any,
  classes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  popperProps: PropTypes.shape({
    classes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placement: PropTypes.string,
    parentOverflow: PropTypes.string,
    scrollWillClosePopper: PropTypes.bool,
    disablePortal: PropTypes.bool,
  }),
  buttonProps: PropTypes.object,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  handleShowInput: PropTypes.func,
  handleChangeZoomRatio: PropTypes.func,
  handleChangeZoomValue: PropTypes.func,
  handlePressEnter: PropTypes.func,
  showInput: PropTypes.bool,
  inputRef: PropTypes.object,
  disabled: PropTypes.bool,
  useHover: PropTypes.bool,
  useInput: PropTypes.bool,
  zoomRatio: PropTypes.string,
  renderPopperContent: PropTypes.func,
  children: PropTypes.node,
  onBlurZoomInput: PropTypes.func,
  onClickZoomInput: PropTypes.func,
  triggerOpen: PropTypes.bool,
  customAnchorEl: PropTypes.any,
  className: PropTypes.string,
  isOpenModalData: PropTypes.bool,
  rootStyle: PropTypes.object,
  autoHeightMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onMouseEnter: PropTypes.func,
  tooltip: PropTypes.shape({
    title: PropTypes.node,
    closeOnFocus: PropTypes.bool,
  }),
  onMouseOver: PropTypes.func,
  eventTracking: PropTypes.func,
  backgroundColor: PropTypes.string,
};

const defaultProps = {
  ButtonComponent: CustomButton,
  classes: null,
  className: '',
  popperProps: {
    classes: null,
    placement: 'bottom',
    parentOverflow: 'scrollParent',
    scrollWillClosePopper: false,
    disablePortal: true,
  },
  buttonProps: {},
  onClose: () => { },
  onOpen: () => { },
  handleShowInput: () => { },
  handleChangeZoomRatio: () => { },
  handleChangeZoomValue: () => { },
  handlePressEnter: () => { },
  showInput: false,
  inputRef: {},
  disabled: false,
  useHover: false,
  useInput: false,
  zoomRatio: '0',
  renderPopperContent: () => { },
  children: null,
  onBlurZoomInput: () => { },
  onClickZoomInput: () => { },
  triggerOpen: false,
  customAnchorEl: null,
  isOpenModalData: false,
  rootStyle: {},
  autoHeightMax: 'auto',
  onMouseEnter: () => {},
  tooltip: {
    title: null,
    closeOnFocus: false,
  },
  onMouseOver: () => {},
  eventTracking: () => {},
  backgroundColor: '',
};

class PopperButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      arrowRef: null,
      anchorEl: null,
      open: false,
      openTooltip: false,
    };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.triggerOpen) {
      this.ref.current.click();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { open } = this.state;
    this.handleClose(this.state, prevState);
    if (this.props.isOpenModalData && this.props.isOpenModalData !== prevProps.isOpenModalData) {
      this._closePopper();
    }
    if (this.props.triggerOpen !== prevProps.triggerOpen) {
      if (!this.props.triggerOpen && !open) {
        return;
      }
      this.ref.current.click();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClose = (currentState, prevState) => {
    const { open: currentIsOpen } = currentState;
    const { open: prevIsOpen } = prevState;
    const { onClose } = this.props;
    if (!currentIsOpen && currentIsOpen !== prevIsOpen) {
      onClose();
    }
  };

  childrenWithProps = () => {
    const { children } = this.props;
    const { open } = this.state;
    return React.Children.map(children, (child) => {
      // Checking isValidElement is the safe way and avoids a typescript
      // error too.
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { open, className: classNames(child.props.className, { active: open }) });
      }
      return child;
    });
  };

  _handleTogglePopper = (event) => {
    const { open } = this.state;
    const {
      onOpen, onClose, disabled, tooltip,
    } = this.props;
    const anchorEl = event.currentTarget;
    if (tooltip.closeOnFocus) {
      this.setState({
        openTooltip: false,
      });
    }
    if (disabled || !this._isMounted) return;
    if (!open) {
      onOpen(event);
    } else {
      onClose(event);
    }
    this.setState((prevState) => ({
      open: !prevState.open,
      anchorEl,
    }));
  };

  _openPopper = (event) => {
    this.props.onOpen();
    // this.props.closeElements(['toolsOverlay', 'searchOverlay', 'toolStylePopup', 'viewControlsOverlay']);
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  _closePopper = () => {
    this.setState({
      open: false,
    });
  };

  _handleClickAway = (event) => {
    const { showInput } = this.props;
    if (
      event &&
      this.state.anchorEl &&
      this.state.anchorEl.contains(event.target) ||
      !this._isMounted
    ) {
      return;
    }
    this.setState({ open: false });
    showInput && this.props.handleShowInput();
  };

  handleClickZoomButton = (e, forceClose) => {
    this.props.eventTracking();
    const { showInput } = this.props;
    if (!forceClose && showInput) {
      return;
    }
    this._handleTogglePopper(e);
    showInput && this.props.handleShowInput();
  };

  handleClickZoomInputValue = (e) => {
    this.props.eventTracking();
    if (this.state.open) {
      return;
    }
    this.props.handleShowInput();
    this._handleTogglePopper(e);
  };

  renderInput = () => {
    const {
      zoomRatio,
      showInput,
      handleChangeZoomValue,
      handlePressEnter,
      onBlurZoomInput,
      onClickZoomInput,
      inputRef,
    } = this.props;

    const { open } = this.state;
    const renderBtnValueClassName = () => classNames('ZoomButton__btn-item ZoomButton__btn-value', {
      'ZoomButton__btn--editable': !open,
    });

    return (
      <Tooltip title="action.zoom">
        <div>
          <Button disableRipple className="ZoomButton__btn">
            <Grid wrap="nowrap" container spacing={0} alignItems="center">
              <Grid
                item
                className={renderBtnValueClassName()}
                onClick={this.handleClickZoomInputValue}
              >
                {showInput ? (
                  <input
                    type="number"
                    className="ZoomButton__input"
                    value={parseInt(zoomRatio.split('%')[0]) || ''}
                    onChange={handleChangeZoomValue}
                    ref={inputRef}
                    onKeyPress={(e) => handlePressEnter(e, this._closePopper)}
                    onBlur={(e) => onBlurZoomInput(e, this._closePopper)}
                    onClick={() => {
                      this.props.eventTracking();
                      onClickZoomInput(this._closePopper);
                    }}
                  />
                ) : (
                  <div>{zoomRatio}</div>
                )}
              </Grid>
              <Grid
                item
                className="ZoomButton__btn-item ZoomButton__btn-item__icon"
                onClick={(e) => this.handleClickZoomButton(e, true)}
              >
                <Icomoon className="light-arrow-down" />
              </Grid>
            </Grid>
          </Button>
        </div>
      </Tooltip>
    );
  };

  renderButton = () => {
    const { open, openTooltip } = this.state;
    const {
      useHover,
      useInput,
      classes,
      ButtonComponent,
      disabled,
      className,
      onMouseEnter,
      tooltip,
      buttonProps,
    } = this.props;
    if (useHover) {
      return (
        <div
          className={classNames(classes, className, {
            active: open,
          })}
          onMouseEnter={this._openPopper}
          onMouseLeave={this._closePopper}
        >
          {this.childrenWithProps()}
        </div>
      );
    }
    if (useInput) {
      return this.renderInput();
    }
    const isStringClasses = isString(classes);
    const isObjectClasses = isObject(classes);
    const buttonEventProps = tooltip.closeOnFocus ? {
      onMouseEnter: (e) => {
        this.setState({ openTooltip: true });
        onMouseEnter(e);
      },
      onMouseLeave: () => this.setState({ openTooltip: false }),
    } : {
      onMouseEnter,
    };
    const buttonPopper = (
      <ButtonComponent
        className={classNames(className, {
          active: open,
          [classes]: isStringClasses,
        })}
        classes={isObjectClasses ? classes : null}
        ref={this.ref}
        onClick={this._handleTogglePopper}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        disabled={disabled}
        {...buttonEventProps}
        {...buttonProps}
      >
        {this.childrenWithProps()}
      </ButtonComponent>
    );

    if (!tooltip.title) {
      return buttonPopper;
    }
    const tooltipProps = tooltip.closeOnFocus ? {
      open: openTooltip,
    } : {};
    return (
      <SharedTooltip {...tooltipProps} title={tooltip.title}>
        {buttonPopper}
      </SharedTooltip>
    );
  };

  render() {
    const { anchorEl, open } = this.state;
    const {
      renderPopperContent,
      popperProps,
      customAnchorEl,
      autoHeightMax,
      backgroundColor,
    } = this.props;
    return (
      <>
        {this.renderButton()}
        {open && (
          <MaterialPopper
            open
            anchorEl={customAnchorEl || anchorEl}
            handleClose={this._handleClickAway}
            {...popperProps}
            onClose={this._closePopper}
            autoHeightMax={autoHeightMax}
            backgroundColor={backgroundColor}
          >
            {renderPopperContent({ closePopper: this._closePopper, open })}
          </MaterialPopper>
        )}
      </>
    );
  }
}

PopperButton.propTypes = propTypes;
PopperButton.defaultProps = defaultProps;

export default PopperButton;
