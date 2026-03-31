import { Text, Avatar, Button, IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import actions from 'actions';

import { useIsMountedRef, useTranslation } from 'hooks';

import { organizationServices, userServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import { avatar as avatarUtils, errorUtils, eventTracking, toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getTrendingUrl } from 'utils/orgUrlUtils';

import UserEventConstants from 'constants/eventConstants';
import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';
import { JOIN_ORGANIZATION_STATUS, JOIN_ORGANIZATION_PERMISSION_TYPE } from 'constants/organizationConstants';
import { USER_METADATA_KEY } from 'constants/userConstants';

import { SuggestedOrganization } from 'interfaces/organization/organization.interface';

import styles from './SuggestedWorkspace.module.scss';

export interface SuggestedWorkspacesProps {
  suggestedWorkspace: SuggestedOrganization;
}

const SuggestedWorkspaces = ({ suggestedWorkspace }: SuggestedWorkspacesProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // state
  const [loading, setLoading] = useState(false);
  const isMountedRef = useIsMountedRef();

  const submitHandler = (callback: () => Promise<void>) => async () => {
    try {
      setLoading(true);
      await callback();
    } catch (error) {
      if (!errorUtils.handleScimBlockedError(error)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const updateJoinedOrganization = (url: string) => {
    toastUtils.success({
      message: t('workspaceSwitcher.suggestedWorkspace.joinedMessage'),
      useReskinToast: true,
    });
    batch(() => {
      dispatch(actions.removeMainOrganizationCanRequest());
      dispatch(actions.fetchOrganizations());
      dispatch(actions.fetchCurrentOrganization(url));
    });
    navigate(getTrendingUrl({ orgUrl: url }));
  };

  const requestJoinOrg = async () => {
    await organizationServices.requestJoinOrganization();
    // track event
    orgTracking.trackSelectSuggestedOrganization({
      suggestedOrganizationId: suggestedWorkspace._id,
      permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
    });
    // track new event - workspaceSwitcher
    eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
      elementName: ButtonName.WORKSPACE_SWITCHER_REQUEST_ACCESS_WORKSPACE,
    }).catch(() => {});
    toastUtils.success({
      message: t('workspaceSwitcher.suggestedWorkspace.requestHasBeenSubmittedMessage'),
      useReskinToast: true,
    });
    dispatch(actions.updateStatusRequestMainOrganization(JOIN_ORGANIZATION_STATUS.REQUESTED));
  };

  const joinOrg = async () => {
    const {
      organization: { url },
    } = await organizationServices.joinOrganization({ orgId: suggestedWorkspace._id });
    // track event
    orgTracking.trackSelectSuggestedOrganization({
      suggestedOrganizationId: suggestedWorkspace._id,
      permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
    });
    // track new event - workspaceSwitcher
    eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
      elementName: ButtonName.WORKSPACE_SWITCHER_JOIN_WORKSPACE,
    }).catch(() => {});
    updateJoinedOrganization(url);
  };

  const acceptInvitation = async () => {
    const {
      organization: { url },
    } = await organizationServices.acceptOrganizationInvitation({ orgId: suggestedWorkspace._id });
    updateJoinedOrganization(url);
  };

  const renderRequestJoinButton = (joinStatus: string) => {
    switch (joinStatus) {
      case JOIN_ORGANIZATION_STATUS.CAN_JOIN: {
        return (
          <Button variant="tonal" loading={loading} onClick={submitHandler(joinOrg)} data-cy="join_button">
            {t('workspaceSwitcher.suggestedWorkspace.join')}
          </Button>
        );
      }
      case JOIN_ORGANIZATION_STATUS.CAN_REQUEST: {
        return (
          <Button variant="tonal" loading={loading} onClick={submitHandler(requestJoinOrg)} data-cy="request_button">
            {t('workspaceSwitcher.suggestedWorkspace.request')}
          </Button>
        );
      }
      case JOIN_ORGANIZATION_STATUS.REQUESTED: {
        return (
          <Button variant="tonal" disabled data-cy="requested_button">
            {t('workspaceSwitcher.suggestedWorkspace.requested')}
          </Button>
        );
      }
      case JOIN_ORGANIZATION_STATUS.PENDING_INVITE: {
        return (
          <Button variant="tonal" loading={loading} onClick={submitHandler(acceptInvitation)} data-cy="accept_button">
            {t('workspaceSwitcher.suggestedWorkspace.accept')}
          </Button>
        );
      }
      default:
        return null;
    }
  };

  const closeSuggestedOrganzation = async () => {
    try {
      await userServices.updateUserMetadata({ key: USER_METADATA_KEY.IS_HIDDEN_SUGGESTED_ORGANIZATION, value: true });
      dispatch(actions.removeMainOrganizationCanRequest());
      eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
        elementName: ButtonName.WORKSPACE_SWITCHER_CLOSE_SUGGESTED_WORKSPACE,
      }).catch(() => {});
    } catch (err) {
      toastUtils.error({
        message: t('joinOrg.somethingWentWrong'),
        useReskinToast: true,
      });
    }
  };

  return (
    <div className={styles.container} data-cy="suggested_workspace_section">
      <div className={styles.header}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('workspaceSwitcher.suggestedWorkspace.workspaceCanJoin')}
        </Text>
        <IconButton size="sm" icon="x-sm" onClick={closeSuggestedOrganzation} data-cy="close_button" />
      </div>
      <div className={styles.suggestedWorkspaceList}>
        <div className={styles.suggestedWorkspaceItem}>
          <div className={styles.suggestedWorkspaceItemInfo}>
            <Avatar
              size="sm"
              variant="outline"
              src={avatarUtils.getAvatar(suggestedWorkspace.avatarRemoteId) || DefaultOrgAvatar}
              name={suggestedWorkspace.name}
            />
            <PlainTooltip content={suggestedWorkspace.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
              <Text type="title" size="sm" ellipsis className={styles.suggestedWorkspaceItemName}>
                {suggestedWorkspace.name}
              </Text>
            </PlainTooltip>
          </div>
          {renderRequestJoinButton(suggestedWorkspace.joinStatus)}
        </div>
      </div>
    </div>
  );
};

export default SuggestedWorkspaces;
