import { Tabs, NotiBadge, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { IFolder } from 'interfaces/folder/folder.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';

import { ResultTabs } from '../../constants/moveDocumentConstant';

import styles from './SearchResultHeader.module.scss';

type SearchResultHeaderProps = {
  tab: ResultTabs;
  teamResults: ITeam[];
  folderResults: IFolder[];
  orgResults: IOrganization[];
  onTabChange: (tab: ResultTabs) => void;
};

const SearchResultHeader = ({
  tab: currentTab,
  onTabChange,
  teamResults,
  folderResults,
  orgResults,
}: SearchResultHeaderProps) => {
  const { t } = useTranslation();

  const getBadgeBgColorByTab = (tab: ResultTabs) =>
    tab === currentTab ? 'var(--kiwi-colors-core-primary)' : 'var(--kiwi-colors-surface-on-surface-variant)';

  return (
    <Tabs mb="var(--kiwi-spacing-1)" value={currentTab} onChange={onTabChange}>
      <Tabs.List pl="var(--kiwi-spacing-2)" className={styles.tabsList}>
        <Tabs.Tab
          value={ResultTabs.TEAMS}
          rightSection={
            <NotiBadge
              labelColor="var(--kiwi-colors-core-on-primary)"
              backgroundColor={getBadgeBgColorByTab(ResultTabs.TEAMS)}
              size="lg"
              label={`${teamResults.length + orgResults.length}`}
            />
          }
        >
          <Text type="label" size="md">
            {t('sidebar.spaces')}
          </Text>
        </Tabs.Tab>
        <Tabs.Tab
          value={ResultTabs.FOLDERS}
          rightSection={
            <NotiBadge
              labelColor="var(--kiwi-colors-core-on-primary)"
              backgroundColor={getBadgeBgColorByTab(ResultTabs.FOLDERS)}
              size="lg"
              label={`${folderResults.length}`}
            />
          }
        >
          <Text type="label" size="md">
            {t('common.folders')}
          </Text>
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default SearchResultHeader;
