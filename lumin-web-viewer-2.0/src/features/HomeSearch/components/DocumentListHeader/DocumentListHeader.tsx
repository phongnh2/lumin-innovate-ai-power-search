import classNames from 'classnames';
import React from 'react';

import { useTranslation } from 'hooks';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import styles from './DocumentListHeader.module.scss';

const DocumentListHeader = () => {
  const { t } = useTranslation();
  const { isVisible } = useChatbotStore();

  return (
    <div className={styles.container} data-chatbot-opened={isVisible}>
      <span className={styles.column}>{t('common.name')}</span>
      <div className={classNames(styles.column, styles.ownerCol)}>
        <span>{t('common.owner')}</span>
      </div>
      <span className={classNames(styles.column, styles.storageCol)}>{t('common.storage')}</span>
      <span className={classNames(styles.column, styles.lastUpdated)}>{t('documentPage.lastOpened')}</span>
    </div>
  );
};

export default DocumentListHeader;
