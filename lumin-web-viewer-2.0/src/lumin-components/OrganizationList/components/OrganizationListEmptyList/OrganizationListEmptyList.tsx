import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useMatch } from 'react-router';

import NoResultsFound from 'assets/reskin/images/no-results-found.png';
import SearchingView from 'assets/reskin/images/searching-documents.png';

import { useTranslation } from 'hooks';

import { ORG_TEXT } from 'constants/organizationConstants';

import styles from './OrganizationListEmptyList.module.scss';

type OrganizationListEmptyListProps = {
  searchKey: string;
};

const OrganizationListEmptyList = ({ searchKey }: OrganizationListEmptyListProps) => {
  const { t } = useTranslation();
  const isOrgMembersPage = Boolean(useMatch({ path: `${ORG_TEXT}/:orgDomain/members`, end: false }));

  if (searchKey) {
    return (
      <div className={classNames(styles.container, isOrgMembersPage && styles.membersPage, styles.searching)}>
        <img src={NoResultsFound} width={200} height={160} alt="No results found" />
        <div className={styles.wrapper}>
          <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
            {t('memberPage.noResult')}
          </Text>
          <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('searchDocument.tryAgain')}.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.container, isOrgMembersPage && styles.membersPage)}>
      <img src={SearchingView} width={174} height={150} alt="Empty list" />
      <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {t('memberPage.noMembersInList')}
      </Text>
    </div>
  );
};

export default OrganizationListEmptyList;
