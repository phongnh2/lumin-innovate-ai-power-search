import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import NoResultsFound from 'assets/reskin/images/no-results-found.png';

import { useTranslation } from 'hooks';

import styles from './NoSearchResults.module.scss';

const NoSearchResults = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img className={styles.img} src={NoResultsFound} alt="No search results" />
      <Text className={styles.title} type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
        {t('searchDocument.noResult')}
      </Text>
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('searchDocument.tryAgain')}.
      </Text>
    </div>
  );
};

export default NoSearchResults;
