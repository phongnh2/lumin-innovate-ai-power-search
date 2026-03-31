/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { BroadcastChannel } from 'broadcast-channel';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import selectors from 'selectors';

import { ButtonColor, ButtonSize } from 'luminComponents/ButtonMaterial';
import Icomoon from 'luminComponents/Icomoon';
import Switch from 'luminComponents/Shared/Switch';

import { useTranslation } from 'hooks/useTranslation';

import indexedDBService from 'services/indexedDBService';

import { isMobile } from 'helpers/device';

import { autoCompleteEvent } from 'utils/Factory/EventCollection/AutoCompleteEventCollection';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { formFieldAutocompleteBase } from 'features/FormFieldAutosuggestion';
import { FormFieldSuggestion } from 'features/FormFieldAutosuggestion/types';

import { BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';
import { Colors } from 'constants/styles';

import { IUser } from 'interfaces/user/user.interface';

import EntryList from './EntryList';
import * as GeneralSettingStyled from '../GeneralPreferences.styled';

import * as Styled from './AutoCompleteSection.styled';

function AutoCompleteSection(): JSX.Element {
  const { t } = useTranslation();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const [open, setOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [entries, setEntries] = useState([] as FormFieldSuggestion[]);
  const [selectedEntryList, setSelectedEntryList] = useState([] as string[]);
  const isMobileDevice = isMobile();
  const totalSelect = selectedEntryList.length;
  const totalEntries = entries.length;
  const isIndeterminateState = totalSelect > 0 && totalSelect < totalEntries;

  const setEntryList = async (): Promise<void> => {
    const entryList = await formFieldAutocompleteBase.getAll();
    setEntries(entryList);
  };

  const deleteAll = (): void => {
    const toastMessage =
      selectedEntryList.length === 1 ? t('settingGeneral.toastDeleteEntry') : t('settingGeneral.toastDeleteAllEntries');
    selectedEntryList.forEach((entry) => formFieldAutocompleteBase.delete(entry));
    setSelectedEntryList([]);
    enqueueSnackbar({ message: toastMessage, variant: 'success' });
    setEntryList();
  };

  const onChangeSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedEntryList(entries.map(({ content }) => content));
    } else {
      setSelectedEntryList([]);
    }
  };

  const onSwitchChange = (enabled: boolean): void => {
    indexedDBService.setAutoCompleteFormField(enabled, currentUser._id);
    setIsEnabled(enabled);
    const toggleFeatureChannel = new BroadcastChannel<boolean>(BROADCAST_CHANNEL_KEY.TOGGLE_FORM_FIELD_SUGGESTION);
    toggleFeatureChannel.postMessage(enabled);
    if (enabled) {
      enqueueSnackbar({ message: t('settingGeneral.toastEnableAutoComplete'), variant: 'success' });
      autoCompleteEvent.toggleEnable();
    } else {
      autoCompleteEvent.toggleDisable();
    }
  };

  useEffect(() => {
    setEntryList();
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedEntryList([]);
    }
  }, [open]);

  useEffect(() => {
    indexedDBService.isEnabledAutoCompleteFormField(currentUser._id).then((isFeatureEnabled) => {
      setIsEnabled(!!isFeatureEnabled);
    });
  }, []);

  return (
    <GeneralSettingStyled.Group>
      <GeneralSettingStyled.Title>{t('settingGeneral.autoCompleteFormFields')}</GeneralSettingStyled.Title>
      <GeneralSettingStyled.Container>
        <GeneralSettingStyled.SubTitle>
          <Trans i18nKey="settingGeneral.messageAutoCompleteFormFields" components={{ br: <br /> }} />
        </GeneralSettingStyled.SubTitle>
        <Switch
          // @ts-ignore
          checked={isEnabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSwitchChange(e.target.checked)}
        />
      </GeneralSettingStyled.Container>
      <Styled.EntryListContainer>
        <Styled.Wrapper>
          {Boolean(selectedEntryList.length) && (
            <Styled.SelectAllWrapper>
              <Styled.CheckBox
                // @ts-ignore
                checked={totalSelect === totalEntries}
                type="checkbox"
                indeterminate={isIndeterminateState}
                onChange={onChangeSelectAll}
              />
              <Styled.SelectedText>
                {t('common.textSelected', { totalSelectDoc: totalSelect, totalDoc: totalEntries })}
              </Styled.SelectedText>
              <Styled.Divider />
              <Styled.Button
                size={ButtonSize.MD}
                color={ButtonColor.TERTIARY}
                onClick={deleteAll}
                data-lumin-btn-name={
                  selectedEntryList.length === 1
                    ? ButtonName.REMOVE_AUTO_COMPLETE_ENTRY
                    : ButtonName.REMOVE_MULTIPLE_AUTO_COMPLETE_ENTRIES
                }
              >
                <Icomoon className="trash" size={18} color={isMobileDevice ? Colors.NEUTRAL_60 : Colors.NEUTRAL_100} />
                <Styled.TrashText>{t('common.delete')}</Styled.TrashText>
              </Styled.Button>
            </Styled.SelectAllWrapper>
          )}
          {(isMobileDevice || !selectedEntryList.length) && (
            <Styled.Title>{t('settingGeneral.entryList')}</Styled.Title>
          )}
          <Styled.ViewAllWrapper onClick={() => setOpen((prevState) => !prevState)}>
            <Styled.Text>{open ? t('common.hide') : t('common.viewAll')}</Styled.Text>
            <Icomoon className={open ? 'arrow-up' : 'arrow-down-alt'} color={Colors.SECONDARY_50} size={14} />
          </Styled.ViewAllWrapper>
        </Styled.Wrapper>
        {open && (
          <EntryList
            entries={entries}
            setEntryList={setEntryList}
            selectedEntryList={selectedEntryList}
            setSelectedEntryList={setSelectedEntryList}
          />
        )}
      </Styled.EntryListContainer>
    </GeneralSettingStyled.Group>
  );
}

export default AutoCompleteSection;
