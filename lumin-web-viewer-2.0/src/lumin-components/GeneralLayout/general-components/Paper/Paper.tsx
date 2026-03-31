import classNames from 'classnames';
import { Paper as KiwiPaper, PaperRadius, PaperShadow } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { LuminPaperProps } from './Paper.interfaces';

import styles from './Paper.module.scss';

const Paper = React.forwardRef<HTMLDivElement, LuminPaperProps>(
  ({ elevation = 3, rounded = 'medium', className, ...otherProps }, ref) => {
    const mappedElevation =
      {
        0: PaperShadow.xs,
        1: PaperShadow.sm,
        2: PaperShadow.md,
        3: PaperShadow.lg,
        4: PaperShadow.xl,
        5: PaperShadow.xl,
      }[elevation] || PaperShadow.md;

    const mappedRadius =
      {
        none: PaperRadius.sm,
        small: PaperRadius.sm,
        medium: PaperRadius.md,
        large: PaperRadius.lg,
      }[rounded] || PaperRadius.md;

    return (
      <KiwiPaper
        {...otherProps}
        className={classNames(styles.paper, className)}
        ref={ref}
        elevation={mappedElevation}
        radius={mappedRadius}
      />
    );
  }
);

Paper.propTypes = {
  elevation: PropTypes.oneOf([0, 1, 2, 3, 4, 5]),
  rounded: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
};

export default Paper;
