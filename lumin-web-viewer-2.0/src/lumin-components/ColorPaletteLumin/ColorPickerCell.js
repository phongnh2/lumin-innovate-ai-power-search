import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { textToolPopperOffset } from '@new-ui/components/AnnotationPopup/components/PopupMainContent';
import { ChromePickerContainer } from '@new-ui/general-components/ColorPickerCell/ColorPickerCell.styled';
import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';

import SvgElement from 'luminComponents/SvgElement';

import { convertColorObject } from 'helpers/convertColorObject';

import './ColorPickerCell.scss';
import * as styles from './V2/ColorPickerCell.styled';

const initialColor = { R: 0, G: 0, B: 0, A: 1 };

class ColorPickerCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      color: convertColorObject(this.props.initialColor),
      isOnTextTool: this.props.textToolAnchorRef !== null,
    };
  }

  handleToggleColorPicker = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ displayColorPicker: !this.state.displayColorPicker });

    if (this.state.isOnTextTool) {
      this.props.onOpenFreeTextToolChromePicker();
    }
  };

  handleChange = ({ rgb }) => {
    this.setState({ color: rgb });
  };

  setPalette = () => {
    const { color } = this.state;
    if (color) {
      this.props.setPalette(`rgb(${color.r}, ${color.g}, ${color.b})`);
    }
    this.handleToggleColorPicker();
  };

  handleClosePicker = () => {
    this.setState({ displayColorPicker: false });
  };

  getLayoutConfig = () => {
    const { isToolbarPopoverOpened } = this.props;
    return {
      buttonCancelProps: {
        variant: 'outlined',
      },
      buttonConfirmProps: {
        variant: 'filled',
      },
      popperProps: {
        disablePortal: isToolbarPopoverOpened,
        modifiers: [
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              ...(isToolbarPopoverOpened ? { boundary: 'viewport' } : { padding: 8 }),
            },
          },
          {
            name: 'offset',
            options: this.state.isOnTextTool && {
              offset: [textToolPopperOffset.horizontal, textToolPopperOffset.vertical],
            },
          },
        ],
        popperOptions: {
          strategy: 'fixed',
        },
        onClose: this.handleClosePicker,
      },
    };
  };

  render() {
    const { placement, t, textToolAnchorRef, onCompletedFreeTextToolChromePicker } = this.props;
    const { displayColorPicker, color, isOnTextTool } = this.state;
    return (
      <>
        <IconButton
          onClick={this.handleToggleColorPicker}
          ref={(node) => {
            this.anchorEl = node;
          }}
        >
          <SvgElement content="color-picker" width={24} height={24} />
        </IconButton>

        <Popper
          open={displayColorPicker}
          anchorEl={!isOnTextTool ? this.anchorEl : textToolAnchorRef}
          placement={placement}
          {...this.getLayoutConfig().popperProps}
        >
          <div css={isOnTextTool ? styles.textToolPopperContainer : styles.popperContainer}>
            <ChromePickerContainer
              className="ChromePicker"
              disableAlpha
              color={color}
              width="auto"
              onChangeComplete={(rgb) => {
                if (isOnTextTool) {
                  const { rgb: textColor } = rgb;
                  this.setState({ color });
                  this.props.setPalette(`rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`);
                  this.handleClosePicker();
                  onCompletedFreeTextToolChromePicker();
                } else {
                  this.handleChange(rgb);
                }
              }}
              styles={{
                default: {
                  picker: { boxShadow: 'none', borderRadius: 8 },
                  body: {
                    padding: '16px 0',
                  },
                },
              }}
            />
            {!isOnTextTool ? (
              <div>
                <div className="divider horizontal" />
                <div className="ColorPickerPopper__actions">
                  <Button {...this.getLayoutConfig().buttonCancelProps} onClick={this.handleToggleColorPicker}>
                    {t('common.cancel')}
                  </Button>

                  <Button {...this.getLayoutConfig().buttonConfirmProps} onClick={this.setPalette}>
                    {t('common.confirm')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Popper>
      </>
    );
  }
}

ColorPickerCell.propTypes = {
  bg: PropTypes.string,
  setPalette: PropTypes.func,
  placement: PropTypes.string,
  t: PropTypes.func,
  isContentEditPalette: PropTypes.bool,
  isOpenRightToolPanel: PropTypes.bool,
  initialColor: PropTypes.object,
  textToolAnchorRef: PropTypes.object,
  onOpenFreeTextToolChromePicker: PropTypes.func,
  onCompletedFreeTextToolChromePicker: PropTypes.func,
  isToolbarPopoverOpened: PropTypes.bool,
};

ColorPickerCell.defaultProps = {
  placement: 'bottom',
  bg: '',
  setPalette: () => {},
  t: () => {},
  isContentEditPalette: false,
  isOpenRightToolPanel: false,
  initialColor: new window.Core.Annotations.Color(initialColor.R, initialColor.G, initialColor.B, initialColor.A),
  textToolAnchorRef: null,
  onOpenFreeTextToolChromePicker: () => {},
  onCompletedFreeTextToolChromePicker: () => {},
  isToolbarPopoverOpened: false,
};

export default withTranslation()(ColorPickerCell);
