import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Colors } from 'constants/styles';
import './CircularLoading.scss';

const propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

const defaultProps = {
  color: Colors.PRIMARY_80,
  size: 32,
  style: {},
  fullWidth: false,
  className: '',
};

const useStyles = makeStyles({
  loader: {
    color: (props) => props.color,
  },
});
function CircularLoading({
  color, size, style, fullWidth, className,
}) {
  const classes = useStyles({ color });
  return (
    <div
      className={classNames('CircularLoading', className, {
        'CircularLoading__full-width': fullWidth,
      })}
      style={style}
    >
      <CircularProgress className={classes.loader} size={size} />
    </div>
  );
}

CircularLoading.propTypes = propTypes;
CircularLoading.defaultProps = defaultProps;

export default CircularLoading;
