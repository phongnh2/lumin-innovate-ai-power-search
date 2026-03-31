import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import styles from './SemanticWarning.module.scss';

const SemanticWarning = ({ content }: { content: React.ReactNode }) => (
  <div className={styles.wrapper}>
    <Icomoon className="md_status_warning" color="var(--kiwi-colors-semantic-on-warning-container)" size={24} />
    {content}
  </div>
);

export default SemanticWarning;
