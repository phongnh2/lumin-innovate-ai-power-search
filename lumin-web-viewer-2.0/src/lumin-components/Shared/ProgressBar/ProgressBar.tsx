import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
  width: CSSProperties['width'];
  className?: string;
};

const ProgressBar = ({ width, className }: ProgressBarProps) => (
  <div className={classNames(styles.progressContainer, className)}>
    <div className={styles.completed} style={{ width }} />
  </div>
);

export default ProgressBar;
