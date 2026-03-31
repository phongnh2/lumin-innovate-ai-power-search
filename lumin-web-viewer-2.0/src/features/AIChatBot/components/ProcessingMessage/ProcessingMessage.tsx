import { Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './ProcessingMessage.module.scss';

const ProcessingMessage: React.FC<{ content?: string }> = ({ content }) => (
    <div className={styles.loading}>
      <Icomoon type="ph-sparkle-fill" size="lg" />
      <p>{content}</p>
    </div>
  );

export default ProcessingMessage;
