import { Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { TFunction } from 'react-i18next';
import { useResolvedPath } from 'react-router';

import { SubSidebarItem } from '@web-new-ui/components/SubSidebarItem';

import selectors from 'selectors';

import { useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from '../../LeftSubSidebar.module.scss';
import { SkeletonSubSidebar } from '../SkeletonSubSidebar';

const SettingTabs = (t: TFunction) => [
  {
    id: '1',
    icon: 'insight-md',
    name: t('common.insights'),
    url: '',
    dataCy: 'insights_sidebar',
    dataLuminBtnName: NavigationNames.INSIGHTS,
  },
  {
    id: '2',
    icon: 'users-md',
    name: t('common.people'),
    url: 'people',
    dataCy: 'people_sidebar',
    dataLuminBtnName: NavigationNames.PEOPLE,
  },
  {
    id: '3',
    icon: 'receipt-md',
    name: t('common.billing'),
    url: 'billing',
    dataCy: 'billing_sidebar',
    dataLuminBtnName: NavigationNames.BILLING,
  },
  {
    id: '4',
    icon: 'shield-md',
    name: t('common.security'),
    url: 'security',
    dataCy: 'security_sidebar',
    dataLuminBtnName: NavigationNames.SECURITY,
  },
  {
    id: '5',
    icon: 'preferences-md',
    name: t('common.preferences'),
    url: 'settings',
    dataCy: 'settings_sidebar',
    dataLuminBtnName: NavigationNames.PREFERENCE,
  },
  {
    id: '6',
    icon: 'ph-wrench',
    name: t('developerApi.title'),
    url: 'developer-settings',
    dataCy: 'developer_api_sidebar',
    dataLuminBtnName: NavigationNames.DEVELOPER_API,
  },
];

const DashboardSubSidebar = () => {
  const { t } = useTranslation();
  const { pathname } = useResolvedPath('');
  const url = `${pathname}/dashboard`;
  const { loading } = useShallowSelector(selectors.getCurrentOrganization) || {};

  if (loading) {
    return <SkeletonSubSidebar />;
  }

  const renderDocumentTab = (): JSX.Element[] =>
    Object.values(SettingTabs(t)).map((item) => (
      <SubSidebarItem
        end
        key={item.id}
        title={item.name}
        leftElement={<Icomoon type={item.icon} size="md" color="var(--kiwi-colors-surface-on-surface)" />}
        to={item.url ? `${url}/${item.url}` : url}
        activeTab="settingTab"
        data-cy={item.dataCy}
        data-lumin-btn-name={item.dataLuminBtnName}
        data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
      />
    ));
  return <div className={styles.itemsContainer}>{renderDocumentTab()}</div>;
};

export default DashboardSubSidebar;
