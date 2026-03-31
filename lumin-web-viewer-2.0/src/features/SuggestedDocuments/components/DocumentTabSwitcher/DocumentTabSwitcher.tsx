import classNames from 'classnames';
import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { useHomeMatch, useTranslation } from 'hooks';

import { SuggestedDocsTypes } from 'features/SuggestedDocuments';

import TeamSelector from '../TeamSelector';

import styles from './DocumentTabSwitcher.module.scss';

const tabs = [
  {
    value: SuggestedDocsTypes.RECENT,
    icon: 'recent-lg',
    label: 'suggestedDocuments.recently',
    dataCy: 'recently_tab',
  },
  {
    value: SuggestedDocsTypes.TRENDING,
    icon: 'trending-lg',
    label: 'suggestedDocuments.trending',
    dataCy: 'trending_tab',
  },
];

const DocumentTabSwitcher = () => {
  const { t } = useTranslation();

  const { isTrendingTab } = useHomeMatch();

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsWrapper}>
        {tabs.map((tab) => (
          <NavLink tabIndex={-1} to={tab.value} end key={tab.value}>
            {({ isActive }) => (
              <Button
                key={tab.value}
                size="lg"
                variant="tonal"
                data-activated={isActive}
                className={styles.tab}
                startIcon={<Icomoon type={tab.icon} size="lg" />}
                value={tab.value}
                data-cy={tab.dataCy}
                classNames={{
                  root: classNames(styles.tabInner, { [styles.tabInnerActivated]: isActive }),
                }}
              >
                {t(tab.label)}
              </Button>
            )}
          </NavLink>
        ))}
      </div>
      <div data-hidden={!isTrendingTab} className={styles.teamSelectorWrapper}>
        <TeamSelector />
      </div>
    </div>
  );
};

export default DocumentTabSwitcher;
