import React from 'react';

import styles from './AIToolSection.module.scss';

const AIToolSection = ({ sectionTitle, children }: { sectionTitle: string; children: React.ReactNode }) => (
  <>
    <p className={styles.title}>{sectionTitle}</p>
    {children}
  </>
);

export default AIToolSection;
