import {
  Paper,
  Avatar,
  PlainTooltip,
  Text,
  Chip,
  IconButton,
  AvatarGroup,
  Menu,
  MenuItem,
  Icomoon as KiwiIcomoon,
} from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import defaultAvatar from 'assets/lumin-svgs/avt-dummy.svg';
import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import Icomoon from 'lumin-components/Icomoon';
import LuminPlanLabel from 'lumin-components/LuminPlanLabel';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import Tooltip from 'lumin-components/Shared/Tooltip';
import OrgNameAndPlanInfo from 'luminComponents/OrgNameAndPlanInfo/OrgNameAndPlanInfo';
import { ChipSize } from 'luminComponents/Shared/Chip/types';

import { useDesktopMatch, useTabletMatch, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { avatar, commonUtils, avatar as avatarUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';
import unitUtils from 'utils/unitUtils';

import { usePromptToUploadLogoStore } from 'features/CNC/CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';
import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';
import { CNCButtonName } from 'features/CNC/constants/events/button';
import { useGetPromptUpdateLogo } from 'features/CNC/hooks';

import { MAX_DISPLAY_MEMBERS } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import {
  ORGANIZATION_ROLE_SHORTEN_KEY,
  ORG_TEXT,
  ORGANIZATION_ROLE_CHIP_COLOR,
  LIMIT_GET_ORGANIZATION_MEMBERS,
} from 'constants/organizationConstants';
import { PaymentStatus } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

import * as Styled from '../OrganizationList.styled';

import styles from './OrganizationListItem.module.scss';

const OrganizationListItem = ({
  organization,
  role,
  setCurrentOrgAndOpenDialog,
  addMemberMobileBtnHandler,
  isReskin,
}) => {
  const { members, settings } = organization;
  const roleUpperCase = role.toUpperCase();
  const roleText = ORGANIZATION_ROLE_SHORTEN_KEY[roleUpperCase];
  const isManager = organizationServices.isManager(roleUpperCase);
  const isAllowMemberCanInvite = settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;
  const remainMember = organization.totalMember - LIMIT_GET_ORGANIZATION_MEMBERS;
  const pendingLength = Math.min(
    LIMIT_GET_ORGANIZATION_MEMBERS - members.length,
    organization.totalMember - members.length
  );
  const mapPendingAvatar = pendingLength > 0 ? Array(pendingLength).fill(1) : [];
  const isDesktopUp = useDesktopMatch();
  const isTabletUp = useTabletMatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [moreActionsOpened, setMoreActionsOpened] = useState(false);
  const { shouldShowPromptUpdateLogo } = useGetPromptUpdateLogo({ currentOrganization: organization });
  const { open: openPromptToUploadLogoModal, setCurrentOrgToUpdateAvatar } = usePromptToUploadLogoStore();

  const getOrgAvatar = ({ avatarRemoteId, size = 72, imgSize = 44 }) => (
    <MaterialAvatar src={avatar.getAvatar(avatarRemoteId)} hasBorder secondary variant="circular" size={size}>
      <Icomoon className="organization-default" color={Colors.NEUTRAL_60} size={imgSize} />
    </MaterialAvatar>
  );

  const getRemainingCount = () => String(unitUtils.getValueWithUnit(remainMember, 0))?.toUpperCase();

  const renderMemberAvatar = () => {
    const sizeAvatar = isTabletUp ? 32 : 20;

    return (
      <>
        {members.map((member) => (
          <Styled.MemberAvatar key={member._id}>
            <MaterialAvatar
              src={avatar.getAvatar(member.avatarRemoteId)}
              size={sizeAvatar}
              secondary
              fontSize={12}
              hasBorder
            >
              {avatar.getTextAvatar(member.name)}
            </MaterialAvatar>
          </Styled.MemberAvatar>
        ))}
        {mapPendingAvatar.map((_, i) => (
          <Styled.MemberAvatar key={i}>
            <MaterialAvatar src={defaultAvatar} size={sizeAvatar} hasBorder />
          </Styled.MemberAvatar>
        ))}
        {remainMember > 0 && (
          <Styled.MemberAvatar>
            <MaterialAvatar size={sizeAvatar} fontSize={!isTabletUp ? 10 : 12} hasBorder>
              {`+${getRemainingCount()}`}
            </MaterialAvatar>
          </Styled.MemberAvatar>
        )}
      </>
    );
  };

  const onOpenDashboard = (event) => {
    event.preventDefault();
    navigate(`/${ORG_TEXT}/${organization.url}/dashboard`);
  };

  const onUploadLogo = (event) => {
    event.preventDefault();
    setCurrentOrgToUpdateAvatar(organization);
    openPromptToUploadLogoModal({
      promptType: PROMPT_TO_UPLOAD_LOGO_TYPE.ORGANIZATION_SETTINGS,
      onChange: () => {},
    });
  };

  const renderPopperContent = () => (
    <Styled.Menu>
      {isManager && (
        <Styled.MenuItem
          onClick={onOpenDashboard}
          data-lumin-btn-name={ButtonName.ORG_DASHBOARD_REDIRECT_FROM_ORG_LIST}
          data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORG_DASHBOARD_REDIRECT_FROM_ORG_LIST]}
        >
          <Icomoon className="dashboard" color={Colors.NEUTRAL_100} size={16} />
          <Styled.TextMenu>{commonUtils.formatTitleCaseByLocale(t('listOrgs.viewDashboard'))}</Styled.TextMenu>
        </Styled.MenuItem>
      )}
      <Styled.MenuItem
        onClick={(e) => setCurrentOrgAndOpenDialog(e, organization)}
        data-lumin-btn-name={ButtonName.INVITE_ORG_MEMBER_MODAL_OPEN_IN_ORG_LIST}
        data-lumin-btn-purpose={ButtonPurpose[ButtonName.INVITE_ORG_MEMBER_MODAL_OPEN_IN_ORG_LIST]}
      >
        <Icomoon className="add-member" color={Colors.NEUTRAL_100} size={18} />
        <Styled.TextMenu>{commonUtils.formatTitleCaseByLocale(t('listOrgs.inviteMember'))}</Styled.TextMenu>
      </Styled.MenuItem>
    </Styled.Menu>
  );

  const handlePopper = (event) => {
    if (!event) {
      return;
    }
    event.preventDefault();
  };

  const renderButton = () => {
    if (!isTabletUp) {
      return (
        (isManager || isAllowMemberCanInvite) && (
          <Styled.MobileAddButton color={ButtonColor.GHOST} onClick={(e) => addMemberMobileBtnHandler(e, organization)}>
            <Icomoon className="add-member" size={18} color={Colors.NEUTRAL_60} />
          </Styled.MobileAddButton>
        )
      );
    }

    return (
      (isManager || isAllowMemberCanInvite) && (
        <Styled.PopperButton
          className="popper-button"
          renderPopperContent={renderPopperContent}
          onOpen={handlePopper}
          onClose={handlePopper}
        >
          <Icomoon className="more-v" color={Colors.NEUTRAL_60} size={14} />
        </Styled.PopperButton>
      )
    );
  };

  if (isReskin) {
    return (
      <Link to={getDefaultOrgUrl({ orgUrl: organization.url })} data-cy={`org_item_${organization._id}`}>
        <Paper shadow="sm" radius="lg" className={styles.container}>
          <div className={styles.detailSection}>
            <div className={styles.avatarSection}>
              <Avatar
                size="xl"
                variant="outline"
                src={avatarUtils.getAvatar(organization.avatarRemoteId) || DefaultOrgAvatar}
                name={organization.name}
              />
              {shouldShowPromptUpdateLogo && (
                <IconButton
                  variant="outline"
                  size="md"
                  icon="image-md"
                  className={styles.uploadLogoBtn}
                  onClick={onUploadLogo}
                  data-lumin-btn-name={CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_LIST}
                />
              )}
            </div>
            <OrgNameAndPlanInfo
              organization={organization}
              containerProps={{ className: styles.orgInfo }}
              orgNameProps={{ className: styles.orgName }}
            />
            <Chip label={t(roleText).toUpperCase()} size="sm" style={ORGANIZATION_ROLE_CHIP_COLOR[roleText]} />
            {isManager && (
              <Menu
                position="bottom-end"
                ComponentTarget={
                  <div className={styles.moreActionsBtn}>
                    <PlainTooltip
                      content={t('listOrgs.moreActions')}
                      position="bottom-end"
                      disableInteractive={moreActionsOpened}
                    >
                      <IconButton
                        icon={<KiwiIcomoon type="dots-vertical-md" color="var(--kiwi-colors-surface-on-surface)" />}
                        onClick={(e) => {
                          handlePopper(e);
                          setMoreActionsOpened((prevState) => !prevState);
                        }}
                        activated={moreActionsOpened}
                        data-cy="more_actions_button"
                      />
                    </PlainTooltip>
                  </div>
                }
                opened={moreActionsOpened}
                onClose={() => setMoreActionsOpened(false)}
                classNames={{
                  dropdown: styles.moreActionsDropdown,
                }}
              >
                <MenuItem
                  leftIconProps={{ type: 'insight-lg', size: 'lg' }}
                  onClick={onOpenDashboard}
                  data-lumin-btn-name={ButtonName.ORG_DASHBOARD_REDIRECT_FROM_ORG_LIST}
                  data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORG_DASHBOARD_REDIRECT_FROM_ORG_LIST]}
                  data-cy="view_dashboard_button"
                >
                  {t('listOrgs.viewDashboard')}
                </MenuItem>
                {shouldShowPromptUpdateLogo && (
                  <MenuItem
                    leftIconProps={{ type: 'image-md', size: 'lg' }}
                    onClick={onUploadLogo}
                    data-lumin-btn-name={CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_LIST}
                  >
                    {t('common.uploadLogo')}
                  </MenuItem>
                )}
              </Menu>
            )}
          </div>
          <div className={styles.memberInfoSection}>
            {(isManager || isAllowMemberCanInvite) && (
              <PlainTooltip content={t('listOrgs.inviteMember')} position="top">
                <div className={styles.inviteMemberBtnWrapper}>
                  <IconButton
                    size="sm"
                    icon="plus-sm"
                    className={styles.inviteMemberBtn}
                    onClick={(e) => setCurrentOrgAndOpenDialog(e, organization)}
                    data-lumin-btn-name={ButtonName.INVITE_ORG_MEMBER_MODAL_OPEN_IN_ORG_LIST}
                    data-lumin-btn-purpose={ButtonPurpose[ButtonName.INVITE_ORG_MEMBER_MODAL_OPEN_IN_ORG_LIST]}
                    data-cy="invite_org_member_button"
                  />
                </div>
              </PlainTooltip>
            )}
            <AvatarGroup
              size="xs"
              variant="outline"
              max={MAX_DISPLAY_MEMBERS}
              total={organization.totalMember}
              propsItems={members.map((member) => ({
                src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
                name: member.name,
              }))}
              renderItem={(props) => <Avatar {...props} />}
            />
            <Text type="body" size="sm" color="var(--kiwi-colors-custom-role-web-surface-var-subtext)">
              {t('listOrgs.totalMembers', { total: organization.totalMember })}
            </Text>
          </div>
        </Paper>
      </Link>
    );
  }

  return (
    <Styled.GridItem to={`/${ORG_TEXT}/${organization.url}/documents`} as={Link}>
      <Styled.Wrapper>
        <Styled.RoleContainer>
          <Styled.RoleWrapper>
            <Styled.OrgRole role={roleText} label={t(roleText)} size={ChipSize.SM} />
            <LuminPlanLabel
              paymentType={organization.payment.type}
              trialing={organization.payment.status === PaymentStatus.TRIALING}
              size={ChipSize.SM}
            />
          </Styled.RoleWrapper>
          {renderButton()}
        </Styled.RoleContainer>

        <Styled.CardNameContainer>
          <Styled.AvatarContainer>
            {getOrgAvatar({
              avatarRemoteId: organization.avatarRemoteId,
              size: isDesktopUp ? 56 : 48,
              imgSize: 24,
            })}
          </Styled.AvatarContainer>
          <Tooltip title={organization.name}>
            <Styled.OrgCardName>{organization.name}</Styled.OrgCardName>
          </Tooltip>
          <Styled.MemberAvatarGroup>{renderMemberAvatar()}</Styled.MemberAvatarGroup>
        </Styled.CardNameContainer>
      </Styled.Wrapper>
    </Styled.GridItem>
  );
};

OrganizationListItem.propTypes = {
  organization: PropTypes.object,
  role: PropTypes.string,
  setCurrentOrgAndOpenDialog: PropTypes.func,
  addMemberMobileBtnHandler: PropTypes.func,
  isReskin: PropTypes.bool,
};

OrganizationListItem.defaultProps = {
  organization: {},
  role: '',
  setCurrentOrgAndOpenDialog: () => {},
  addMemberMobileBtnHandler: () => {},
  isReskin: false,
};

export default OrganizationListItem;
