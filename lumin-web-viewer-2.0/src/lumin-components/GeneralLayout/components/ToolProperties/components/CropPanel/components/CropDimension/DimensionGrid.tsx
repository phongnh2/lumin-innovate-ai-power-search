import React from 'react';

import styles from './CropDimension.module.scss';

const DimensionGrid = ({ children }: { children: React.ReactNode }) => <div className={styles.grid}>{children}</div>;

export default DimensionGrid;
