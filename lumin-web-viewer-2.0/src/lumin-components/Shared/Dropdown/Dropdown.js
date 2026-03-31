import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Icomoon from 'luminComponents/Icomoon';
import PopperButton from 'luminComponents/PopperButton';

import { useThemeMode } from 'hooks';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors, DarkTheme, LightTheme } from 'constants/styles';

import {
  StyledButtonWrapper,
  StyledLabel,
  StyledText,
  StyledListItem,
  StyledList,
  StyledItemIcon,
  StyledLabelWrapper,
} from './Dropdown.styled';

const DROPDOWN_ICON = {
  dropdown: 'dropdown',
  arrow: 'arrow',
};

const CustomPopperButton = withStyles({
  root: {
    padding: 0,
    minWidth: 'unset',
    maxWidth: '100%',
    overflow: 'hidden',
  },
})(Button);

function Dropdown(props) {
  const {
    onChange,
    data,
    value,
    icon,
    iconSize,
    itemIconSize,
    classes,
    useInInput,
    iconColor,
    popperClasses,
    textWrap,
    labelClassName,
    ...otherProps
  } = props;
  const theme = useThemeMode();

  const [open, setOpen] = useState(false);

  const isClickable = data.length !== 1;

  const onItemClick = (e, closePopper, id) => {
    closePopper();
    onChange(id);
  };

  const getActiveItem = () => {
    const itemFound = data.find((item) => item.id === value);
    return (
      <StyledLabelWrapper>
        {itemFound.activeIcon}
        <StyledLabel className={labelClassName} textWrap={textWrap} useInInput={useInInput}>
          {itemFound.label}
        </StyledLabel>
      </StyledLabelWrapper>
    );
  };

  const renderIcon = () => {
    let iconToShow;

    if (!isClickable) {
      return null;
    }

    if (icon === DROPDOWN_ICON.dropdown) {
      iconToShow = icon;
    } else {
      iconToShow = open ? 'light-arrow-up' : 'light-arrow-down';
    }

    return <Icomoon className={iconToShow} size={iconSize} color={iconColor} />;
  };

  const renderContent = ({ closePopper }) => (
    <ThemeProvider theme={theme === THEME_MODE.LIGHT ? LightTheme : DarkTheme}>
      <StyledList>
        {data.map((item, index) => (
          <StyledListItem key={index} onClick={(e) => onItemClick(e, closePopper, item.id)}>
            {item.icon}
            <StyledText textWrap={textWrap}>{item.label}</StyledText>
            {value === item.id && (
              <StyledItemIcon size={itemIconSize} className="icon-check" color={Colors.SECONDARY_50} />
            )}
          </StyledListItem>
        ))}
      </StyledList>
    </ThemeProvider>
  );

  return (
    <PopperButton
      ButtonComponent={CustomPopperButton}
      popperProps={{
        placement: 'bottom-start',
        disablePortal: true,
        classes: popperClasses,
      }}
      renderPopperContent={renderContent}
      disabled={!isClickable}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      classes={classes}
      {...otherProps}
    >
      <StyledButtonWrapper useInInput={useInInput}>
        {getActiveItem()}
        {renderIcon()}
      </StyledButtonWrapper>
    </PopperButton>
  );
}

Dropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  value: PropTypes.string,
  icon: PropTypes.oneOf(Object.values(DROPDOWN_ICON)),
  iconSize: PropTypes.number,
  itemIconSize: PropTypes.number,
  classes: PropTypes.string,
  popperClasses: PropTypes.string,
  useInInput: PropTypes.bool,
  iconColor: PropTypes.oneOf([Colors.PRIMARY, Colors.SECONDARY, Colors.NEUTRAL_80]),
  textWrap: PropTypes.string,
  labelClassName: PropTypes.string,
};

Dropdown.defaultProps = {
  value: '',
  icon: 'dropdown',
  iconSize: 10,
  itemIconSize: 16,
  classes: '',
  popperClasses: '',
  useInInput: false,
  iconColor: Colors.NEUTRAL_80,
  textWrap: 'wrap',
  labelClassName: '',
};

export default Dropdown;
