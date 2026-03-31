import * as React from 'react';

import { VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y } from './constants';

const getPathDescription = ({
  pathRadius,
  counterClockwise,
}: {
  pathRadius: number;
  counterClockwise: boolean;
}): string => {
  const radius = pathRadius;
  const rotation = counterClockwise ? 1 : 0;

  return `
      M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
      a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `;
};

const getDashStyle = ({
  counterClockwise,
  dashRatio,
  pathRadius,
}: {
  counterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
}): object => {
  const diameter = Math.PI * 2 * pathRadius;
  const gapLength = (1 - dashRatio) * diameter;

  return {
    strokeDasharray: `${diameter}px ${diameter}px`,
    strokeDashoffset: `${counterClockwise ? -gapLength : gapLength}px`,
  };
};

const Path = ({
  className,
  counterClockwise,
  dashRatio,
  pathRadius,
  strokeWidth,
  style,
}: {
  className?: string;
  counterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
  strokeWidth: number;
  style?: object;
}): React.ReactElement => (
    <path
      className={className}
      style={({ ...style, ...getDashStyle({ pathRadius, dashRatio, counterClockwise }) })}
      d={getPathDescription({
        pathRadius,
        counterClockwise,
      })}
      strokeWidth={strokeWidth}
      fillOpacity={0}
     />
  );

Path.defaultProps = {
  style: {},
  className: '',
};

export default Path;