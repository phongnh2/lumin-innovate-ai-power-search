import React from 'react';

import styles from './RightPanelProperty.module.scss';

const PropertyTitle: React.FC<{ children?: string }> = ({ children }) => (
  <span className={styles.title}>{children}</span>
);

const PropertyContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.content}>{children}</div>
);

export const RightPanelProperty: React.FC<{ children?: React.ReactNode }> & {
  Title: typeof PropertyTitle;
  Content: typeof PropertyContent;
} = ({ children }) => <div className={styles.panelProperty}>{children}</div>;

RightPanelProperty.Title = PropertyTitle;
RightPanelProperty.Content = PropertyContent;

export default RightPanelProperty;
