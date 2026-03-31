import { MenuList } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Icomoon from 'lumin-components/Icomoon';
import MenuItem from 'lumin-components/Shared/MenuItem';

import { useStylesWithTheme } from 'hooks';

const useStyles = makeStyles({
  menuList: {
    padding: 0,
    minWidth: 180,
  },
  icon: {
    marginRight: 12,
  },
});

const Popover = (props) => {
  const { closePopper, children } = props;
  const classes = useStylesWithTheme(useStyles, props);

  const withClosePopper = useCallback((callback) => {
    closePopper();
    callback();
  }, [closePopper]);

  const renderItem = useCallback(
    ({
      value, icon, text, onClick, size
    }) => (
      <MenuItem
        key={value}
        onClick={() => withClosePopper(() => onClick(value))}
      >
        <Icomoon className={[icon, classes.icon].join(' ')} size={size} /> {text}
      </MenuItem>
    ),
    [classes.icon, withClosePopper],
  );

  return (
    <MenuList classes={{ root: classes.menuList }}>
      {children({
        renderItem,
      })}
    </MenuList>
  );
};

Popover.propTypes = {
  closePopper: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
};

export default React.memo(Popover);
