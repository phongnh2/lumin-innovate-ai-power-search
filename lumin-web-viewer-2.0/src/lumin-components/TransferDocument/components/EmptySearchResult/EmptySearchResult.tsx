import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import NoResultsFoundDark from 'assets/reskin/images/no-results-found-dark.png';
import NoResultsFound from 'assets/reskin/images/no-results-found.png';

import { useThemeMode, useTranslation } from 'hooks';

import { THEME_MODE } from 'constants/lumin-common';

import styles from './EmptySearchResult.module.scss';

const EmptySearchResult = () => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();

  return (
    <div className={styles.container}>
      <img
        className={styles.image}
        src={themeMode === THEME_MODE.DARK ? NoResultsFoundDark : NoResultsFound}
        alt="No results found"
      />
      <div className={styles.contentWrapper}>
        <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
          {t('searchDocument.noResult')}
        </Text>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-low)">
          {t('searchDocument.tryAgain')}
        </Text>
      </div>
    </div>
  );
};

export default EmptySearchResult;
