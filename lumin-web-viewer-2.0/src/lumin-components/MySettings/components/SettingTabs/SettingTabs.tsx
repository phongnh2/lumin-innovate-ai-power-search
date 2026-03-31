/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { makeStyles } from '@mui/styles';
import React, { useEffect, useMemo, useState } from 'react';

import { cachingFileHandler, Handler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';

import { OFFLINE_STATUS, OFFLINE_STORAGE_ACTION } from 'constants/offlineConstant';
import { SettingTabEnum } from 'constants/settingConstant';
import { Breakpoints, Colors } from 'constants/styles';

import * as Styled from './SettingTabs.styled';

const TABS = [
  { value: SettingTabEnum.GENERAL, label: 'common.general', disabled: false },
  { value: SettingTabEnum.PREFERENCES, label: 'common.preferences', disabled: false },
  { value: SettingTabEnum.BILLING, label: 'common.billing', disabled: false },
];

const useStyles = makeStyles({
  tab: {
    flex: 'auto',
    color: Colors.NEUTRAL_80,
    minWidth: 0,
    padding: '0 12px',
    [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
      padding: '0 16px',
      minWidth: 100,
    },
  },
  tabActive: {
    color: Colors.NEUTRAL_100,
  },
});

type Props = {
  onChange: (tab: SettingTabEnum) => void;
  activeTab: SettingTabEnum;
};

function SettingTabs({ activeTab, onChange }: Props): JSX.Element {
  const classes = useStyles();
  const [newUpdateAvailable, setNewUpdateAvailable] = useState<boolean>(false);
  const { t } = useTranslation();

  const tabs = useMemo(
    () =>
      TABS.map((item) => {
        const isGeneralTab = item.value === SettingTabEnum.GENERAL;
        return {
          ...item,
          label: t(item.label),
          suffix: newUpdateAvailable && isGeneralTab && <Styled.RedBadge>1</Styled.RedBadge>,
        };
      }),
    [newUpdateAvailable]
  );

  const _messageHandler = ({ process }: { process: { action: string; status: string; success: string } }): void => {
    if (process.success) {
      if (process.action === OFFLINE_STORAGE_ACTION.SOURCE_UPDATE && process.status) {
        setNewUpdateAvailable(process.status !== OFFLINE_STATUS.OK);
      }
      if (cachingFileHandler.isCleanSourceSuccess(process)) {
        setNewUpdateAvailable(false);
      }
    }
  };

  useEffect(() => {
    if (Handler.isOfflineEnabled) {
      cachingFileHandler
        .shouldManualUpdate()
        .then((newUpdate: boolean) => setNewUpdateAvailable(newUpdate))
        .catch(() => {});
      cachingFileHandler.subServiceWorkerHandler(_messageHandler);
      return () => cachingFileHandler.unSubServiceWorkerHandler(_messageHandler);
    }
  }, []);

  return (
    <Styled.Tabs
      classes={classes}
      tabs={tabs}
      onChange={onChange}
      value={activeTab}
      activeBarColor={Colors.SECONDARY_50}
    />
  );
}

export default SettingTabs;
