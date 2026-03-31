/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { RadioGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import Dialog from 'lumin-components/Dialog';
import Icomoon from 'lumin-components/Icomoon';
import Loading from 'lumin-components/Loading';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import Radio from 'lumin-components/Shared/Radio';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTabletMatch, useTranslation } from 'hooks';

import avatarUtils from 'utils/avatar';

import { Colors } from 'constants/styles';
import { ModalSize } from 'constants/styles/Modal';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

import useSelectWorkspace from './hooks/useSelectWorkspace';

import * as Styled from './SelectDefaultWorkspaceModal.styled';

type Props = {
  title: string;
  onCancel: () => void;
  submitLabel: string;
  shouldWarningSetworkspace: boolean;
  onSubmit: () => void;
  message: string;
};

const SelectDefaultWorkspaceModal = ({
  title,
  onCancel,
  submitLabel,
  shouldWarningSetworkspace = false,
  onSubmit = () => {},
  message,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const isTablet = useTabletMatch();
  const [selectWorkspace, setSelectWorkspace] = useState<string>('');
  const [shouldUpdateWorkspace, setshouldUpdateWorkspace] = useState<boolean>(true);
  const { handleRadioChange, submitUpdateWorkspace } = useSelectWorkspace({
    shouldSetDefaultWorkspace: shouldUpdateWorkspace,
    setSelectWorkspace,
    onSubmit,
    selectWorkspace,
    message,
  });
  const { data: organizationList, loading } = useSelector<unknown, OrganizationList>(
    selectors.getOrganizationList,
    shallowEqual
  );
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const getLastAccessOrg = (): {
    organization: IOrganization;
    role: string;
  } => organizationList.find((organization) => organization.organization.url === currentUser.lastAccessedOrgUrl);

  const renderItem = (item: { organization: IOrganization }): JSX.Element => {
    const { name, _id, avatarRemoteId } = item.organization;
    // @ts-ignore
    const defaultAvatar = <Icomoon className="default-org-2" size={16} color={Colors.NEUTRAL_60} />;
    return (
      <Styled.LabelContainer key={_id}>
        <MaterialAvatar src={avatarUtils.getAvatar(avatarRemoteId)} size={32} variant="circular" hasBorder secondary>
          {defaultAvatar}
        </MaterialAvatar>
        <Styled.Label>{name}</Styled.Label>
      </Styled.LabelContainer>
    );
  };

  const radioClasses = Styled.useRadioGroupStyles();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (currentUser?.setting.defaultWorkspace) {
      setSelectWorkspace(currentUser.setting.defaultWorkspace);
      return;
    }
    if (organizationList?.length === 1) {
      setSelectWorkspace(organizationList[0]?.organization._id);
      return;
    }
    if (getLastAccessOrg()) {
      setSelectWorkspace(getLastAccessOrg().organization._id);
    }
  }, [loading]);

  return (
    // @ts-ignore
    <Dialog open width={ModalSize.MDX} noPadding>
      {loading ? (
        // @ts-ignore
        <Loading normal containerStyle={{ margin: '100px 0' }} />
      ) : (
        <Styled.ModalContainer>
          <Styled.Title>{title}</Styled.Title>
          <RadioGroup onChange={handleRadioChange} classes={{ root: radioClasses.root }}>
            {organizationList?.map((item) => {
              const isChecked = selectWorkspace === item.organization._id;

              return (
                <Styled.FormControlLabel
                  key={item.organization._id}
                  checked={isChecked}
                  value={item.organization._id}
                  control={<Radio size={20} />}
                  label={renderItem(item)}
                  disabled={isChecked}
                />
              );
            })}
          </RadioGroup>
          <Styled.Divider />
          {shouldWarningSetworkspace && (
            <Styled.WarningContainer>
              <Styled.WarningGroup>
                <Styled.WaringText>{t('modalSelectDefaultWorkspace.warningText')}</Styled.WaringText>
                {/* @ts-ignore */}
                <Tooltip title={t('modalSelectDefaultWorkspace.tooltipText')}>
                  {/* @ts-ignore */}
                  <Icomoon className="info" size={isTablet ? 18 : 14} color={Colors.NEUTRAL_60} />
                </Tooltip>
              </Styled.WarningGroup>
              <Styled.CheckboxCustom
                // @ts-ignore
                checked={shouldUpdateWorkspace}
                onChange={() => setshouldUpdateWorkspace((prev) => !prev)}
              />
            </Styled.WarningContainer>
          )}
          <Styled.ModalFooterContainer
            disabled={!selectWorkspace}
            label={submitLabel}
            onCancel={onCancel}
            onSubmit={() => {
              submitUpdateWorkspace();
            }}
          />
        </Styled.ModalContainer>
      )}
    </Dialog>
  );
};

export default SelectDefaultWorkspaceModal;
