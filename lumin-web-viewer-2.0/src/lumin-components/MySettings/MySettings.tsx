/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import actions from 'actions';

import GeneralPreferences from 'luminComponents/GeneralPreferences';
import SettingBilling from 'luminComponents/SettingBilling';
import SettingPreferences from 'luminComponents/SettingPreferences';

import withLightTheme from 'HOC/withLightTheme';

import { useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';
import { SettingTabEnum } from 'constants/settingConstant';

import SettingTabs from './components/SettingTabs';
import { SettingDialogContext } from './SettingDialogContext';

import * as Styled from './SettingDialog.styled';

import styles from './MySettings.module.scss';

function MySettings(): JSX.Element {
  const dispatch = useDispatch();
  const [isDirty, setDirty] = useState(false);
  const { t } = useTranslation();
  const { type: tab } = useParams();
  const navigate = useNavigate();

  const handleDirty = (next = () => {}): void => {
    if (isDirty) {
      dispatch(
        actions.openModal({
          type: ModalTypes.WARNING,
          title: t('settingGeneral.discardUnsavedChanges'),
          confirmButtonTitle: t('common.discard'),
          onConfirm: next,
          onCancel: () => {},
        })
      );
    } else {
      next();
    }
  };

  const setActiveTab = (_tab: SettingTabEnum): void => {
    handleDirty(() => {
      setDirty(false);
      navigate(`/settings/${_tab}`, { replace: true });
    });
  };

  const contextMemo = useMemo(
    () => ({
      setDirty,
    }),
    []
  );

  return (
    <SettingDialogContext.Provider value={contextMemo}>
      <div className={styles.container}>
        <Styled.HeaderContainer>
          <Styled.Header>
            <Styled.Title>{t('common.settings')}</Styled.Title>
          </Styled.Header>
          <SettingTabs activeTab={tab as SettingTabEnum} onChange={setActiveTab} />
        </Styled.HeaderContainer>
        <div className={styles.tabContainer}>
          {tab === SettingTabEnum.GENERAL && <GeneralPreferences />}
          {tab === SettingTabEnum.PREFERENCES && <SettingPreferences />}
          {tab === SettingTabEnum.BILLING && <SettingBilling />}
        </div>
      </div>
    </SettingDialogContext.Provider>
  );
}

export default withLightTheme(MySettings);
