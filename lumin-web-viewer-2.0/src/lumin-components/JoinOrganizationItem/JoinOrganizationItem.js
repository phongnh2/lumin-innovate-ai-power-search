import classNames from 'classnames';
import { Avatar, Text, PlainTooltip, AvatarGroup, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

import defaultAvatar from 'assets/lumin-svgs/avt-dummy.svg';
import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { useTranslation } from 'hooks';

import orgTracking from 'services/awsTracking/organizationTracking';

import { avatar, commonUtils } from 'utils';
import { getLanguage } from 'utils/getLanguage';
import unitUtils from 'utils/unitUtils';

import { LANGUAGES } from 'constants/language';
import { JOIN_ORGANIZATION_PERMISSION_TYPE, JOIN_ORGANIZATION_STATUS } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import * as Styled from './JoinOrganizationItem.styled';

import styles from './JoinOrganizationItem.module.scss';

const MAX_MEMBER = 3;

const JoinOrganizationItem = ({ organization, onClick, isSubmitting, isReskin }) => {
  const { name: orgName, avatarRemoteId: orgAvatar, members, status, joinStatus } = organization;
  const suggestedOrgStatus = status || joinStatus;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const ButtonTextMapping = useMemo(
    () => ({
      [JOIN_ORGANIZATION_STATUS.CAN_REQUEST]: t('joinOrg.requestAccess'),
      [JOIN_ORGANIZATION_STATUS.CAN_JOIN]: t('common.join'),
      [JOIN_ORGANIZATION_STATUS.PENDING_INVITE]: t('joinOrg.acceptInvite'),
      [JOIN_ORGANIZATION_STATUS.REQUESTED]: t('common.requested'),
    }),
    [t]
  );
  const textButton = commonUtils.formatTitleCaseByLocale(ButtonTextMapping[suggestedOrgStatus]);
  const remainMember = organization.totalMember - MAX_MEMBER;
  const pendingLength = Math.min(MAX_MEMBER - members.length, organization.totalMember - members.length);
  const mapPendingAvatar = pendingLength > 0 ? Array(pendingLength).fill(1) : [];
  const isRequested = suggestedOrgStatus === JOIN_ORGANIZATION_STATUS.REQUESTED;

  const getRemainingCount = () => String(unitUtils.getValueWithUnit(remainMember, 0))?.toUpperCase();

  const handleClick = async () => {
    try {
      setLoading(true);
      await onClick(organization);
    } finally {
      setLoading(false);
    }
  };

  const renderMemberAvatar = () => (
    <>
      {members.map((member) => (
        <Styled.MemberAvatar key={member._id}>
          <MaterialAvatar src={avatar.getAvatar(member.avatarRemoteId)} size={20} secondary fontSize={10} hasBorder>
            {avatar.getTextAvatar(member.name)}
          </MaterialAvatar>
        </Styled.MemberAvatar>
      ))}
      {mapPendingAvatar.map((_, i) => (
        <Styled.MemberAvatar key={i}>
          <MaterialAvatar src={defaultAvatar} size={20} hasBorder />
        </Styled.MemberAvatar>
      ))}
      {remainMember > 0 && (
        <Styled.MemberAvatar>
          <MaterialAvatar size={20} fontSize={10} hasBorder>
            {`+${getRemainingCount()}`}
          </MaterialAvatar>
        </Styled.MemberAvatar>
      )}
    </>
  );

  useEffect(() => {
    const permissionType = {
      [JOIN_ORGANIZATION_STATUS.PENDING_INVITE]: JOIN_ORGANIZATION_PERMISSION_TYPE.ACCEPT_INVITE,
      [JOIN_ORGANIZATION_STATUS.CAN_REQUEST]: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
      [JOIN_ORGANIZATION_STATUS.CAN_JOIN]: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
    }[suggestedOrgStatus];
    orgTracking.trackViewSuggestedOrganization({
      suggestedOrganizationId: organization._id,
      permissionType,
    });
  }, []);

  if (isReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.orgInfoWrapper}>
          <Avatar
            variant="outline"
            size="xl"
            src={avatar.getAvatar(orgAvatar) || DefaultOrgAvatar}
            placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
            alt="workspace avatar"
          />
          <div className={styles.orgInfo}>
            <PlainTooltip content={orgName}>
              <Text size="md" type="headline" color="var(--kiwi-colors-surface-on-surface)" ellipsis>
                {orgName}
              </Text>
            </PlainTooltip>
            <AvatarGroup
              size="xs"
              max={5}
              total={organization.totalMember}
              variant="outline"
              propsItems={members.map((member) => ({
                src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
                name: member.name,
              }))}
              renderItem={(props) => <Avatar {...props} />}
            />
          </div>
        </div>
        <Button
          className={classNames(styles.actionButton, getLanguage() === LANGUAGES.EN && styles.normalWidth)}
          variant="filled"
          loading={loading}
          disabled={isSubmitting || isRequested}
          onClick={handleClick}
        >
          {textButton}
        </Button>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.Content>
        <MaterialAvatar size={56} src={avatar.getAvatar(orgAvatar)}>
          <Icomoon className="organization-default" size={18} color={Colors.NEUTRAL_60} />
        </MaterialAvatar>
        <Styled.Info>
          <Styled.Name>
            <Styled.OrgName>{orgName}</Styled.OrgName>
          </Styled.Name>
          <Styled.MemberAvatarGroup>{renderMemberAvatar()}</Styled.MemberAvatarGroup>
        </Styled.Info>
      </Styled.Content>
      <Styled.Button
        onClick={handleClick}
        color={ButtonColor.PRIMARY_BLACK}
        loading={loading}
        disabled={isSubmitting || isRequested}
        isLongText={textButton.length > 14}
      >
        {textButton}
      </Styled.Button>
    </Styled.Container>
  );
};

JoinOrganizationItem.propTypes = {
  organization: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isReskin: PropTypes.bool,
};

JoinOrganizationItem.defaultProps = {
  isReskin: false,
};

export default JoinOrganizationItem;
