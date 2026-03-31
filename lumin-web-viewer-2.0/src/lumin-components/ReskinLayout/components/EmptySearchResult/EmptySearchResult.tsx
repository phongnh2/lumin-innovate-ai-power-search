import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import NoResultsFound from 'assets/reskin/images/no-results-found.png';

import { DEFAULT_SEARCH_VIEW_TYPE } from 'luminComponents/DefaultSearchView';

import { useTranslation } from 'hooks';

import styles from './EmptySearchResult.module.scss';

type EmptySearchResultProps = {
  type?: string;
};

const EmptySearchResult = ({ type }: EmptySearchResultProps) => {
  const { t } = useTranslation();
  return (
    <div
      id="document-list-root"
      className={classNames(styles.container, type === DEFAULT_SEARCH_VIEW_TYPE.HOME && styles.home)}
    >
      <img width={204} height={162} src={NoResultsFound} alt="No results found" />
      <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {t('searchDocument.noResult')}
      </Text>
      <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('searchDocument.tryAgain')}
      </Text>
    </div>
  );
};

export default EmptySearchResult;
