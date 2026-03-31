import { CircularProgress, Paper } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './BottomToast.module.scss';

const BottomToast = ({
  message,
  progressBgColor = 'var(--kiwi-colors-surface-inverse-on-surface)',
  progressColor = 'var(--kiwi-colors-surface-inverse-surface)',
  bgColor = 'var(--kiwi-colors-surface-inverse-surface)',
  color = 'var(--kiwi-colors-surface-inverse-on-surface)',
}: {
  message: string;
  progressBgColor?: string;
  progressColor?: string;
  bgColor?: string;
  color?: string;
}) => (
  <div className={styles.container}>
    <Paper>
      <div className={styles.wrapper} style={{ backgroundColor: bgColor, color }}>
        <CircularProgress size="xs" bgColor={progressBgColor} color={progressColor} />
        <span>{message}</span>
      </div>
    </Paper>
  </div>
);

export default BottomToast;
