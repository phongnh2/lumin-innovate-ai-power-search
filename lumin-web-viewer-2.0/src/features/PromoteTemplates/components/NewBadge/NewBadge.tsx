import React from 'react';

import styles from './NewBadge.module.scss';

type NewBadgeProps = {
  size?: 'sm' | 'md';
};

const NewBadge = ({ size = 'md' }: NewBadgeProps) => <div className={styles.redDot} data-size={size} />;

export default NewBadge;
