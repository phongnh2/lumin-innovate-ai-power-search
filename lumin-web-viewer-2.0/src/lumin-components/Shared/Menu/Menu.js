import MaterialMenu from '@mui/material/Menu';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

Menu.propTypes = {
  children: PropTypes.node.isRequired,
  menuStyle: PropTypes.object,
};

Menu.defaultProps = {
  menuStyle: {},
};

const useStyles = makeStyles({
  list: ({ menuStyle }) => ({
    borderRadius: 4,
    boxShadow: '0 3px 5px -1px rgba(128, 147, 167, 0.2), 0 1px 18px 0 rgba(128, 147, 167, 0.12), 0 6px 10px 0 rgba(128, 147, 167, 0.14)',
    border: 'solid 2px #c1d1e0',
    backgroundColor: '#fff',
    paddingTop: 6,
    paddingBottom: 6,
    ...menuStyle,
  }),
});

function Menu(props) {
  const {
    children, menuStyle, ...otherProps
  } = props;
  const classes = useStyles({ menuStyle });
  return (
    <MaterialMenu
      {...otherProps}
      classes={classes}
    >
      {children}
    </MaterialMenu>
  );
}

export default Menu;
