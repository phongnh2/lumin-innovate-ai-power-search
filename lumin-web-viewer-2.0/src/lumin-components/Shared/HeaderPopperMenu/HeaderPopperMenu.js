import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { Colors } from 'constants/lumin-common';
import './HeaderPopperMenu.scss';

const useMenuListStyles = makeStyles({
  root: {
    minWidth: '132px',
    boxSizing: 'border-box',
    padding: 0,
  },
});

const useMenuItemStyles = makeStyles({
  root: {
    color: 'var(--color-neutral-80)',
    textTransform: 'none',
    fontSize: 14,
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 400,
    height: 40,
    padding: '0 16px',
  },
});

function HeaderPopperMenu(props) {
  const {
    data, activeOption, extraClass, handleClick,
  } = props;
  const { t } = useTranslation();

  const classes = {
    list: useMenuListStyles(),
    item: useMenuItemStyles(),
  };
  return (
    <MenuList className={classes.list.root}>
      {data.map((option, index) => (
        <MenuItem
          key={index}
          className={classNames(extraClass, classes.item.root)}
          onClick={() => handleClick(option)}
        >
          {t(option.label)}
          {index === activeOption && (
          <Icomoon
            className="check icon__12 checkIcon"
            color={Colors.SECONDARY_50}
          />
          )}
        </MenuItem>
      ))}
    </MenuList>
  );
}

HeaderPopperMenu.propTypes = {
  data: PropTypes.array,
  activeOption: PropTypes.number,
  extraClass: PropTypes.string,
  handleClick: PropTypes.func,
};

HeaderPopperMenu.defaultProps = {
  data: [],
  activeOption: 0,
  extraClass: '',
  handleClick: () => {},
};

export default HeaderPopperMenu;
