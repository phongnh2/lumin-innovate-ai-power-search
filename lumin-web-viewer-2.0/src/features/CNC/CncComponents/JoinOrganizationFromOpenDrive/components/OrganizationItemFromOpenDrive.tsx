import { Button, ButtonSize, ButtonVariant, Avatar, AvatarGroup, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { useTranslation } from 'hooks/useTranslation';

import { avatar, eventTracking } from 'utils';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { CNCOrganizationEvent } from 'features/CNC/constants/events/organization';
import { useJoinOrganization } from 'features/CNC/hooks/useJoinOrganization';

import { Colors } from 'constants/styles';

import { JoinOrganizationStatus, SuggestedOrganization } from 'interfaces/organization/organization.interface';

import styles from './OrganizationItemFromOpenDrive.module.scss';

const ButtonTextMapping = {
  [JoinOrganizationStatus.CAN_REQUEST]: 'joinOrg.requestAccess',
  [JoinOrganizationStatus.CAN_JOIN]: 'common.join',
  [JoinOrganizationStatus.PENDING_INVITE]: 'joinOrg.acceptInvite',
  [JoinOrganizationStatus.REQUESTED]: 'common.requested',
  [JoinOrganizationStatus.JOINED]: 'common.joined',
};

const ButtonEventMapping = {
  [JoinOrganizationStatus.CAN_REQUEST]:
    CNCButtonName.REQUEST_TO_JOIN_ORGANIZATION_ON_BUSINESS_DOMAIN_TRIAL_ONBOARDING_FLOW,
  [JoinOrganizationStatus.CAN_JOIN]: CNCButtonName.JOIN_ORGANIZATION_ON_BUSINESS_DOMAIN_TRIAL_ONBOARDING_FLOW,
  [JoinOrganizationStatus.PENDING_INVITE]: CNCButtonName.ACCEPT_INVITATION_ON_BUSINESS_DOMAIN_TRIAL_ONBOARDING_FLOW,
  [JoinOrganizationStatus.REQUESTED]: '',
  [JoinOrganizationStatus.JOINED]: '',
};

const MAX_MEMBER = 5;

type Props = {
  organization: SuggestedOrganization;
  onSkip: () => void;
  documentId: string;
  index: number;
};

const OrganizationItemFromOpenDrive = ({ organization, onSkip, documentId, index }: Props) => {
  const { t } = useTranslation();
  useEffect(() => {
    eventTracking(CNCOrganizationEvent.VIEW_SUGGESTED_ORGANIZATIONS, {
      joinType: organization.status,
      orderShown: index,
      organizationSize: organization.totalMember,
      organizationPaymentStatus: organization.payment?.status,
      organizationPaymentType: organization.payment?.type,
    }).catch(() => {});
  }, []);

  const { onClick, isSubmitting } = useJoinOrganization({
    organization,
    trackModalConfirmation: async () => Promise.resolve(),
    updateOrgStatusInList: () => {},
    onSkip,
    documentId,
  });
  const { _id: orgId, name, avatarRemoteId, status, members, totalMember } = organization;
  const isDisableButton = [JoinOrganizationStatus.REQUESTED, JoinOrganizationStatus.JOINED].includes(status);
  const dataLuminBtnName = ButtonEventMapping[status];

  return (
    <div key={orgId} className={styles.circleContainer}>
      <div className={styles.avatarContainer}>
        <MaterialAvatar size={48} src={avatar.getAvatar(avatarRemoteId)}>
          <Icomoon className="organization-default" size={18} color={Colors.NEUTRAL_60} />
        </MaterialAvatar>
        <div className={styles.info}>
          <PlainTooltip content={name} position="top-start">
            <div className={styles.orgName}>{name}</div>
          </PlainTooltip>
          <div className={styles.memberContainer}>
            <AvatarGroup
              size="xs"
              max={totalMember > MAX_MEMBER ? MAX_MEMBER : totalMember}
              total={totalMember}
              variant="outline"
              propsItems={members.map((member) => ({
                src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
                name: member.name,
              }))}
              renderItem={(props) => <Avatar {...props} data-testid="avatar" />}
            />
          </div>
        </div>
      </div>

      <Button
        variant={ButtonVariant.filled}
        size={ButtonSize.md}
        data-lumin-btn-name={dataLuminBtnName}
        data-lumin-btn-purpose={CNCButtonPurpose[dataLuminBtnName]}
        loading={isSubmitting}
        disabled={isDisableButton}
        onClick={onClick}
        className={styles.ctaBtn}
      >
        {t(ButtonTextMapping[status])}
      </Button>
    </div>
  );
};

export default OrganizationItemFromOpenDrive;
