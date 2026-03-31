import MaterialMenuItem from '@mui/material/MenuItem';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import { Fonts } from 'constants/styles';
import themeConstants from 'constants/theme';

const useStyles = makeStyles({
  root: (props) => {
    const styles = themeConstants.MenuItem.menuItemColorGetter(props);
    return {
      minHeight: 40,
      fontFamily: Fonts.PRIMARY,
      fontSize: 14,
      fontWeight: 400,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '20px',
      color: styles.root.color,
      background: styles.root.background,
      '&:hover': {
        color: styles.hover.color,
        background: styles.hover.background,
      },
    };
  },
});

const MenuItem = React.forwardRef((props, ref) => {
  const {
    children, classes, ...otherProps
  } = props;
  const theme = useTheme();
  const customClasses = useStyles({ theme });
  return (
    <MaterialMenuItem
      ref={ref}
      {...otherProps}
      classes={{
        root: classNames(customClasses.root, classes.root),
      }}
    >
      {children}
    </MaterialMenuItem>
  );
});

MenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  ref: PropTypes.object,
  classes: PropTypes.object,
};

MenuItem.defaultProps = {
  ref: null,
  classes: {},
};

export default MenuItem;
