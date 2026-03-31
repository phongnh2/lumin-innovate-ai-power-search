import React from 'react';
import { useNavigate } from 'react-router';

import CustomHeader from 'lumin-components/CustomHeader';
import { LayoutSecondary } from 'lumin-components/Layout';
import MySettings from 'luminComponents/MySettings';

import { useEnableWebReskin } from 'hooks';

import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import styles from './Settings.module.scss';

const Settings = () => {
  const { isEnableReskin } = useEnableWebReskin();
  const navigate = useNavigate();

  const onClickBackButton = () => {
    navigate(sessionStorage.getItem(SESSION_STORAGE_KEY.PREVIOUS_PATH) || Routers.ROOT);
  };

  return (
    <>
      <CustomHeader />
      <LayoutSecondary
        footer={false}
        isReskin={isEnableReskin}
        backgroundColor={isEnableReskin && 'var(--kiwi-colors-surface-surface-container-low)'}
        onClickBackButton={onClickBackButton}
      >
        <div className={styles.container}>
          <MySettings />
        </div>
      </LayoutSecondary>
    </>
  );
};

export default Settings;
