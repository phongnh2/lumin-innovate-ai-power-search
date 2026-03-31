/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Checkbox, TextInput, Text, Divider, InlineMessage } from 'lumin-ui/kiwi-ui';
import React, { ChangeEvent, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import Input from 'lumin-components/Shared/Input';
import { useTransferDocumentContext } from 'lumin-components/TransferDocument/hooks';
import { ITransferDocumentContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useEnableWebReskin, useTabletMatch, useTranslation } from 'hooks';
import { useEnableNestedFolder } from 'hooks/useEnableNestedFolder';

import validator from 'utils/validator';

import { TogglePanelButton } from 'features/NestedFolders/components/NestedFoldersPanel/components';

import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import { ERROR_MESSAGE_DOCUMENT } from 'constants/messages';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import LeftSideBar from '../LeftSideBar';
import RightPanel from '../RightPanel';

import * as Styled from './TransferDocumentBody.styled';

import styles from './TransferDocumentBody.module.scss';

const TransferDocumentBody = (): JSX.Element => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const {
    error,
    errorName,
    isDocumentNameOpen,
    newDocumentName,
    selectedTarget,
    isShowNotify,
    isNotify,
    personalData,
    context,
  } = getter;
  const { setNewDocumentName, setErrorName, setIsNotify } = setter;
  const { t } = useTranslation();
  const isTabletMatch = useTabletMatch();
  const { isEnableReskin } = useEnableWebReskin();
  const { isEnableNestedFolder } = useEnableNestedFolder();
  const [collapsedLeftSidebar, setCollapsedLeftSidebar] = useState(false);
  const [displayToggleButton, setDisplayToggleButton] = useState(false);

  const showLeftSideBar = useMemo(
    () => personalData.isOldProfessional || context.isCopyModal,
    [personalData.isOldProfessional, context.isCopyModal]
  );

  const toggleLeftSidebar = () => setCollapsedLeftSidebar((prevState) => !prevState);

  const onBlur = (): void => {
    const trimName = newDocumentName.trim();
    if (!trimName) {
      setErrorName(t('errorMessage.fieldRequired'));
      return;
    }
    if (trimName.length > MAX_LENGTH_DOCUMENT_NAME) {
      setErrorName(t(ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.key, ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.interpolation));
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewDocumentName(value);
    const { error: err, isValidated } = validator.validateDocumentName(value);
    setErrorName(isValidated ? '' : err);
  };

  const shouldShowNotify =
    isShowNotify && (selectedTarget as IOrganization).totalActiveMember > 1 && context.isCopyModal;

  const showNotifyContent = useMemo(
    () => (
      <Trans
        i18nKey={
          (selectedTarget as IOrganization).totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
            ? 'modalMove.notifyAdministrators'
            : 'modalMove.notifyEveryone'
        }
        values={{ orgName: (selectedTarget as IOrganization).name }}
        components={{ b: <Styled.Bold /> }}
      />
    ),
    [selectedTarget]
  );

  if (isEnableReskin) {
    return (
      <>
        <Styled.TransferDocumentBodyContainerReskin data-increase-height={isDocumentNameOpen}>
          {error && (
            <Styled.ErrorReskin>
              <InlineMessage type="error" message={error} />
            </Styled.ErrorReskin>
          )}
          {isDocumentNameOpen && (
            <Styled.FormControlReskin>
              <Styled.Label type="title" size="sm">
                {t('common.name')}
              </Styled.Label>
              <TextInput
                autoFocus
                value={newDocumentName}
                onBlur={onBlur}
                onChange={onInputChange}
                error={errorName}
                size="lg"
                classNames={{
                  wrapper: styles.documentNameInput,
                }}
              />
            </Styled.FormControlReskin>
          )}
          <Styled.SelectText type="body" size="md">
            {t(context.selectAPlace)}
          </Styled.SelectText>
          <Styled.SideBarContainerReskin>
            {(isTabletMatch || !selectedTarget._id) && showLeftSideBar && (
              <LeftSideBar collapsed={collapsedLeftSidebar} setDisplayToggleButton={setDisplayToggleButton} />
            )}
            {(isTabletMatch || selectedTarget._id) && <RightPanel fullWidth={!showLeftSideBar} />}
            {showLeftSideBar && isEnableNestedFolder && (
              <TogglePanelButton
                collapsed={collapsedLeftSidebar}
                display={displayToggleButton}
                toggle={toggleLeftSidebar}
                setDisplay={setDisplayToggleButton}
              />
            )}
          </Styled.SideBarContainerReskin>
        </Styled.TransferDocumentBodyContainerReskin>
        {shouldShowNotify && (
          <>
            <Styled.NotifyWrapperReskin>
              <Styled.CheckBoxWrapper>
                <Checkbox
                  size="sm"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setIsNotify(e.target.checked)}
                  checked={isNotify}
                />
              </Styled.CheckBoxWrapper>
              <Text
                type="body"
                size="md"
                color="var(--kiwi-colors-surface-on-surface)"
                style={{ wordBreak: 'break-word' }}
              >
                {showNotifyContent}
              </Text>
            </Styled.NotifyWrapperReskin>
            <Divider />
          </>
        )}
      </>
    );
  }

  return (
    <>
      {/* @ts-ignore */}
      <Styled.TransferDocumentBodyContainer $increaseHeight={isDocumentNameOpen}>
        {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
        {isDocumentNameOpen && (
          <Styled.FormControl>
            <Input
              // @ts-ignore
              labelClassName="FormControl__InputLabel"
              className="FormControl__Input"
              autoComplete="off"
              label={t('common.name')}
              value={newDocumentName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setErrorName('');
                setNewDocumentName(e.target.value);
              }}
              onBlur={onBlur}
              errorMessage={errorName}
              autoFocus
            />
          </Styled.FormControl>
        )}
        {/* @ts-ignore */}
        <Styled.SideBarContainer $isShowNotify={shouldShowNotify}>
          {(isTabletMatch || !selectedTarget._id) && showLeftSideBar && <LeftSideBar />}
          {(isTabletMatch || selectedTarget._id) && <RightPanel />}
        </Styled.SideBarContainer>
      </Styled.TransferDocumentBodyContainer>
      {shouldShowNotify && (
        <Styled.NotifyWrapper>
          <Styled.FormControlLabel
            label={<Styled.Notify>{showNotifyContent}</Styled.Notify>}
            control={
              <Styled.CheckBox
                type="checkbox"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setIsNotify(e.target.checked)}
              />
            }
            checked={isNotify}
          />
        </Styled.NotifyWrapper>
      )}
    </>
  );
};
export default TransferDocumentBody;
