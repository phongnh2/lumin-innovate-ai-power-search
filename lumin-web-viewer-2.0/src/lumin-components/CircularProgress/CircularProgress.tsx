/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react';

import {
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  VIEWBOX_HEIGHT_HALF,
  VIEWBOX_CENTER_X,
  VIEWBOX_CENTER_Y,
} from './constants';
import Path from './Path';
import { CircularProgressbarProps } from './types';
import './style.scss';

const CircularProgressbar = ({
  strokeWidth,
  value,
  minValue,
  maxValue,
  circleRatio,
  className,
  classes,
  counterClockwise,
  styles,
  text,
}: CircularProgressbarProps): React.ReactElement => {
  const getPathRadius = () =>
     VIEWBOX_HEIGHT_HALF - strokeWidth / 2;

  const getPathRatio = () => {
    const boundedValue = Math.min(Math.max(value, minValue), maxValue);
    return (boundedValue - minValue) / (maxValue - minValue);
  };

    const pathRadius = getPathRadius();
    const pathRatio = getPathRatio();

    return (
      <svg
        className={`${classes.root} ${className}`}
        style={styles.root}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        data-test-id="CircularProgressbar"
      >
        <Path
          className={classes.trail}
          counterClockwise={counterClockwise}
          dashRatio={circleRatio}
          pathRadius={pathRadius}
          strokeWidth={strokeWidth}
          style={styles.trail}
        />

        <Path
          className={classes.path}
          counterClockwise={counterClockwise}
          dashRatio={pathRatio * circleRatio}
          pathRadius={pathRadius}
          strokeWidth={strokeWidth}
          style={styles.path}
        />

        {text ? (
          <text
            className={classes.text}
            style={styles.text}
            x={VIEWBOX_CENTER_X}
            y={VIEWBOX_CENTER_Y}
          >
            {text}
          </text>
        ) : null}
      </svg>
    );
  };

CircularProgressbar.defaultProps = {
  circleRatio: 1,
  classes: {
    root: 'CircularProgressbar',
    trail: 'CircularProgressbar-trail',
    path: 'CircularProgressbar-path',
    text: 'CircularProgressbar-text',
    background: 'CircularProgressbar-background',
  },
  counterClockwise: false,
  className: '',
  maxValue: 100,
  minValue: 0,
  strokeWidth: 4,
  styles: {
    root: {},
    trail: {},
    path: {},
    text: {},
    background: {},
  },
  text: '',
};

export default CircularProgressbar;