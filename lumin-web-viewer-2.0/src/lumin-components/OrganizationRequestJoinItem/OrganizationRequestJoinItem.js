import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import Icomoon from 'luminComponents/Icomoon';
import * as LeftSidebarStyled from 'luminComponents/LeftSidebar/LeftSidebar.styled';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useTranslation, useIsMountedRef } from 'hooks';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import { toastUtils, avatar as avatarUtils, errorUtils } from 'utils';
import { getTrendingUrl } from 'utils/orgUrlUtils';

import { ModalTypes } from 'constants/lumin-common';
import { JOIN_ORGANIZATION_STATUS, JOIN_ORGANIZATION_PERMISSION_TYPE } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import * as Styled from './OrganizationRequestJoinItem.styled';

const propTypes = {
  orgId: PropTypes.string.isRequired,
  avatarRemoteId: PropTypes.string,
  name: PropTypes.string.isRequired,
  joinStatus: PropTypes.string.isRequired,
};

const defaultProps = {
  avatarRemoteId: '',
};

function OrganizationRequestJoinItem({ orgId, avatarRemoteId, name, joinStatus }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isMountedRef = useIsMountedRef();
  const { t } = useTranslation();

  const submitHandler = (callback) => async () => {
    try {
      setLoading(true);
      await callback();
    } catch (error) {
      if (!errorUtils.handleScimBlockedError(error)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      isMountedRef.current && setLoading(false);
    }
  };

  const updateJoinedOrganization = (url) => {
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: t('joinOrg.joinCircleSuccessfully'),
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
      suggestedOrganizationId: orgId,
      permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
    });
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: t('common.requestHasBeenSent'),
    });
    dispatch(actions.updateStatusRequestMainOrganization(JOIN_ORGANIZATION_STATUS.REQUESTED));
  };

  const joinOrg = async () => {
    const {
      organization: { url },
    } = await organizationServices.joinOrganization({ orgId });
    // track event
    orgTracking.trackSelectSuggestedOrganization({
      suggestedOrganizationId: orgId,
      permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
    });
    updateJoinedOrganization(url);
  };

  const acceptInvitation = async () => {
    const {
      organization: { url },
    } = await organizationServices.acceptOrganizationInvitation({ orgId });
    updateJoinedOrganization(url);
  };

  const renderRequestJoinButton = () => {
    switch (joinStatus) {
      case JOIN_ORGANIZATION_STATUS.CAN_JOIN: {
        return (
          <Styled.ButtonRequest loading={loading} onClick={submitHandler(joinOrg)} color={ButtonColor.SECONDARY_BLACK}>
            {t('common.join')}
          </Styled.ButtonRequest>
        );
      }
      case JOIN_ORGANIZATION_STATUS.CAN_REQUEST: {
        return (
          <Styled.ButtonRequest
            loading={loading}
            onClick={submitHandler(requestJoinOrg)}
            color={ButtonColor.SECONDARY_BLACK}
          >
            {t('common.requestToJoin')}
          </Styled.ButtonRequest>
        );
      }
      case JOIN_ORGANIZATION_STATUS.REQUESTED: {
        return (
          <Styled.ButtonRequest disabled color={ButtonColor.TERTIARY}>
            {t('common.requested')}
          </Styled.ButtonRequest>
        );
      }
      case JOIN_ORGANIZATION_STATUS.PENDING_INVITE: {
        return (
          <Styled.ButtonRequest
            loading={loading}
            onClick={submitHandler(acceptInvitation)}
            color={ButtonColor.SECONDARY_BLACK}
          >
            {t('joinOrg.acceptInvite')}
          </Styled.ButtonRequest>
        );
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    const permissionType = {
      [JOIN_ORGANIZATION_STATUS.CAN_JOIN]: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
      [JOIN_ORGANIZATION_STATUS.CAN_REQUEST]: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
    }[joinStatus];
    orgTracking.trackViewSuggestedOrganization({
      suggestedOrganizationId: orgId,
      permissionType,
    });
  }, []);

  return (
    <>
      <Styled.Divider />
      <Styled.Container>
        <Styled.ListItem>
          <MaterialAvatar
            src={avatarUtils.getAvatar(avatarRemoteId)}
            size={36}
            variant="circular"
            hasBorder
            backgroundColor={Colors.SECONDARY_10}
          >
            <Icomoon className="organization-default" size={16} color={Colors.SECONDARY_50} />
          </MaterialAvatar>
          <Styled.ItemBody>
            <LeftSidebarStyled.Title>{name}</LeftSidebarStyled.Title>
          </Styled.ItemBody>
        </Styled.ListItem>
        {renderRequestJoinButton()}
      </Styled.Container>
    </>
  );
}
OrganizationRequestJoinItem.propTypes = propTypes;
OrganizationRequestJoinItem.defaultProps = defaultProps;

export default OrganizationRequestJoinItem;
