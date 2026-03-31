import MenuList from '@mui/material/MenuList';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import CircularLoading from 'lumin-components/CircularLoading';
import Icomoon from 'luminComponents/Icomoon';
import LuminPlanLabel from 'luminComponents/LuminPlanLabel';
import MenuItem from 'luminComponents/Shared/MenuItem';

import { PaymentStatus } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

import MaterialPopper from '../MaterialPopper';
import './MaterialSelect.scss';

const withStyled = withStyles({
  disabledMenu: {
    '&:hover': {
      cursor: 'auto',
      background: 'inherit',
    },
  },
});

class MaterialSelect extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      popperShow: false,
    };
  }

  togglePopper = () => {
    this.setState(({ popperShow }) => ({
      popperShow: !popperShow,
    }));
  };

  closePopper = (e) => {
    if (this.anchorEl.contains(e.target)) {
      return;
    }
    this.setState({ popperShow: false });
  };

  onItemClick = (item) => {
    const { onSelected } = this.props;
    this.setState({ popperShow: false });
    onSelected(item);
  };

  onClick = () => {
    const { disabled, readOnly } = this.props;
    if (!disabled && !readOnly) {
      this.togglePopper();
    }
  };

  render() {
    const {
      items,
      containerClasses,
      inputClasses,
      value,
      blankMessage,
      disabled,
      readOnly,
      classes,
      childNameComponent,
      arrowStyle,
      arrowIcon,
      loading,
      className,
      scrollbarsMaxheight,
      t,
    } = this.props;
    const { popperShow } = this.state;
    const currentItem = items.find((item) => item.value === value);
    const popoverStyle = {
      width: this.anchorEl?.offsetWidth,
    };
    return (
      <div
        ref={(node) => {
          this.anchorEl = node;
        }}
        className={classNames('MaterialSelect', className, containerClasses, {
          'MaterialSelect--focus': popperShow,
          disabled,
          'read-only': readOnly,
        })}
        onClick={this.onClick}
        role="button"
        tabIndex={0}
      >
        <div
          className={classNames('MaterialSelect__input', {
            [inputClasses]: Boolean(inputClasses),
            'MaterialSelect__input--disabled': disabled,
          })}
        >
          <span
            className={`MaterialSelect__value form__text--overflow ${
              currentItem && currentItem.class ? currentItem.class : ''
            }`}
          >
            {currentItem ? currentItem.name : `- ${t('common.chooseOne')} -`}
          </span>
          {loading ? (
            <div className="MaterialSelect__loading">
              <CircularLoading size={20} />
            </div>
          ) : (
            <Icomoon
              className={`${arrowIcon} MaterialSelect__input__icon_dropdown`}
              color={arrowStyle.color}
              size={arrowStyle.size}
            />
          )}
        </div>
        <MaterialPopper
          open={popperShow}
          anchorEl={this.anchorEl}
          handleClose={this.closePopper}
          placement="bottom-end"
          classes="MaterialSelect__popper"
          style={popoverStyle}
        >
          <MenuList disablePadding>
            <Scrollbars
              autoHeight
              autoHide
              autoHeightMax={scrollbarsMaxheight}
              renderThumbVertical={(props) => <div {...props} className="thumb-vertical" />}
            >
              {items.length > 0 ? (
                items.map((item) => (
                  <MenuItem
                    className={`Menu__item ${item.disabled ? 'disabled' : ''} ${item.selected ? 'selected' : ''}`}
                    key={JSON.stringify(item)}
                    onClick={item.disabled ? null : () => this.onItemClick(item)}
                  >
                    <div className="item__container">
                      <div className={`form__text--overflow ${item.class ?? ''}`}>
                        {`${item.name} ${item.note ? item.note : ''}`} {item.value === value && childNameComponent}
                      </div>
                      <div>
                        {item.payment && (
                          <LuminPlanLabel
                            paymentType={item.payment.type}
                            trialing={item.payment.status === PaymentStatus.TRIALING}
                          />
                        )}
                      </div>
                    </div>
                  </MenuItem>
                ))
              ) : (
                <MenuItem className={classes.disabledMenu} disableRipple>
                  {blankMessage || 'Nothing to choose'}
                </MenuItem>
              )}
            </Scrollbars>
          </MenuList>
        </MaterialPopper>
      </div>
    );
  }
}

MaterialSelect.propTypes = {
  items: PropTypes.array,
  containerClasses: PropTypes.string,
  inputClasses: PropTypes.string,
  value: PropTypes.any,
  blankMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  onSelected: PropTypes.func,
  classes: PropTypes.object,
  childNameComponent: PropTypes.element,
  arrowStyle: PropTypes.shape({
    size: PropTypes.number,
    color: PropTypes.string,
  }),
  arrowIcon: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  scrollbarsMaxheight: PropTypes.number,
  t: PropTypes.func,
};

MaterialSelect.defaultProps = {
  items: [],
  containerClasses: '',
  inputClasses: '',
  value: 0,
  blankMessage: '',
  disabled: false,
  readOnly: false,
  onSelected: () => {},
  classes: {},
  childNameComponent: <div />,
  arrowStyle: {
    size: 10,
    color: Colors.PRIMARY,
  },
  arrowIcon: 'dropdown icon__9',
  loading: false,
  className: '',
  scrollbarsMaxheight: 300,
  t: () => {},
};

export default compose(withStyled, withTranslation())(MaterialSelect);
