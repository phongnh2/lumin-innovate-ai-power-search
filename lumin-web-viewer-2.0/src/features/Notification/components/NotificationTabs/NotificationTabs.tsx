import { Tabs, NotiBadge, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { NotificationTabs as NotificationTabsConstant } from 'constants/notificationConstant';

import styles from './NotificationTabs.module.scss';

type NotificationTab = {
  value: string;
  label: string;
  unreadCount: number;
  buttonName: string;
};

const MAX_UNREAD_COUNT = 9;

const formatNumber = (unreadCount: number): string =>
  unreadCount > MAX_UNREAD_COUNT ? `${MAX_UNREAD_COUNT}+` : unreadCount.toString();

function NotificationTabs() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentTab = useSelector(selectors.getCurrentNotificationTab);
  const { general, invites, requests } = useSelector(selectors.getUserNotificationStatus, shallowEqual) || {};

  const { onKeyDown } = useKeyboardAccessibility();

  const memoTabs = useMemo<NotificationTab[]>(
    () => [
      {
        value: NotificationTabsConstant.GENERAL,
        label: t('common.general'),
        unreadCount: general.unreadCount,
        buttonName: ButtonName.NOTIFICATION_CENTER_GENERAL,
      },
      {
        value: NotificationTabsConstant.INVITES,
        label: t('common.invites'),
        unreadCount: invites.unreadCount,
        buttonName: ButtonName.NOTIFICATION_CENTER_INVITES,
      },
      {
        value: NotificationTabsConstant.REQUESTS,
        label: t('common.requests'),
        unreadCount: requests.unreadCount,
        buttonName: ButtonName.NOTIFICATION_CENTER_REQUESTS,
      },
    ],
    [general, invites, requests]
  );

  const onTabChange = (newTab: string) => {
    dispatch(actions.changeNotificationTab(newTab.toUpperCase()));
  };

  const getBadgeColorByTab = (tab: string) =>
    tab === currentTab
      ? {
          backgroundColor: 'var(--kiwi-colors-core-primary)',
          labelColor: 'var(--kiwi-colors-core-on-primary)',
        }
      : {
          backgroundColor: 'var(--kiwi-colors-surface-surface-container-high)',
          labelColor: 'var(--kiwi-colors-surface-on-surface-low)',
        };

  return (
    <Tabs mt="var(--kiwi-spacing-1)" value={currentTab} onChange={onTabChange}>
      <Tabs.List grow className={styles.tabsList}>
        {memoTabs.map((tab) => (
          <Tabs.Tab
            role="button"
            tabIndex={0}
            key={tab.value}
            value={tab.value}
            rightSection={
              <NotiBadge {...getBadgeColorByTab(tab.value)} size="lg" label={formatNumber(tab.unreadCount ?? 0)} />
            }
            data-cy={`notification_tab_${tab.value?.toLowerCase()}`}
            onKeyDown={onKeyDown}
          >
            <Text type="label" size="md" color={tab.value !== currentTab && getBadgeColorByTab(tab.value).labelColor}>
              {tab.label}
            </Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

export default NotificationTabs;
