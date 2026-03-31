import { Skeleton as MaterialSkeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import { Colors } from 'constants/styles';

import Variants from './types/variants';

const useStyles = makeStyles({
  root: (props) => {
    const {
      variant, radius, color, style, gap,
    } = props;
    const otherStyles = { ...style };
    if (radius && variant !== 'circular') {
      otherStyles.borderRadius = radius;
    }
    return {
      backgroundColor: color || 'var(--color-neutral-20)',
      ...(gap && {
        marginTop: gap.top,
        marginBottom: gap.bottom,
      }),
      ...otherStyles,
    };
  },
});

function Skeleton(props) {
  const { variant, height, width, className, ...otherProps } = props;
  const classes = useStyles(props);
  return (
    <MaterialSkeleton
      classes={classes}
      variant={variant}
      height={height}
      width={width}
      className={className}
      {...otherProps}
    />
  );
}

Skeleton.propTypes = {
  radius: PropTypes.number,
  animation: PropTypes.oneOf(['pulse', 'wave', false]),
  color: PropTypes.string,
  style: PropTypes.object,
  variant: PropTypes.oneOf(Object.values(Variants)),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gap: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  className: PropTypes.string,
};
Skeleton.defaultProps = {
  radius: 4,
  animation: 'wave',
  color: Colors.NEUTRAL_10,
  style: {},
  variant: Variants.TEXT,
  height: 20,
  width: undefined,
  gap: null,
  className: undefined,
};

export default Skeleton;
