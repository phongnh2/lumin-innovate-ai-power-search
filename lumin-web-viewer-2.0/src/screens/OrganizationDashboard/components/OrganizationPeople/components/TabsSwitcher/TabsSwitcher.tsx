import { PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { TAB_TYPES } from './TabsSwitcher.constants';

import styles from './TabsSwitcher.module.scss';

type TabsSwitcherProps = {
  segmentAmount: {
    member: number;
    guest: number;
    pending: number;
    request: number;
  };
  selectedTab: string;
  onTrigger(tab: string): void;
};

const TabsSwitcher = ({ segmentAmount, selectedTab, onTrigger }: TabsSwitcherProps) => {
  const { t } = useTranslation();
  const { onKeyDown } = useKeyboardAccessibility();

  const tabList = useMemo(
    () => [
      {
        type: TAB_TYPES.MEMBER,
        text: t('common.memberS'),
        toolTip: t('orgDashboardPeople.tooltipMember'),
        maxWidthTooltip: 244,
        amount: segmentAmount.member,
      },
      {
        type: TAB_TYPES.GUEST,
        text: t('common.guestS'),
        toolTip: t('orgDashboardPeople.tooltipGuest'),
        maxWidthTooltip: 262,
        amount: segmentAmount.guest,
      },
      {
        type: TAB_TYPES.PENDING,
        text: t('orgDashboardPeople.pendingInvite'),
        toolTip: t('orgDashboardPeople.toolTipPendingInvite'),
        maxWidthTooltip: 222,
        amount: segmentAmount.pending,
      },
      {
        type: TAB_TYPES.REQUEST,
        text: t('orgDashboardPeople.requestAccess'),
        toolTip: t('orgDashboardPeople.toolTipRequestAccess'),
        maxWidthTooltip: 256,
        amount: segmentAmount.request,
      },
    ],
    [segmentAmount, t]
  );

  return (
    <div className={styles.container}>
      {tabList.map((tab, index) => (
        <PlainTooltip offset={8} key={index} maw={tab.maxWidthTooltip} content={`${tab.toolTip}.`}>
          <div
            role="button"
            tabIndex={0}
            key={tab.type}
            data-cy={`org-dashboard-people-tab-${tab.type}`}
            className={styles.tabItem}
            data-selected={tab.type === selectedTab}
            onClick={() => onTrigger(tab.type)}
            onKeyDown={onKeyDown}
          >
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {tab.text}
            </Text>
            <Text type="display" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {tab.amount}
            </Text>
          </div>
        </PlainTooltip>
      ))}
    </div>
  );
};

export default TabsSwitcher;
