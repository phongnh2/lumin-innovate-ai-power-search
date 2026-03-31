import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import selectors from 'selectors';

import Loading from 'lumin-components/Loading';
import { HamburgerContext } from 'lumin-components/NavigationBar/components/Hamburger/context';
import OrganizationRequestJoinItem from 'lumin-components/OrganizationRequestJoinItem';
import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import * as LeftSidebarStyled from 'luminComponents/LeftSidebar/LeftSidebar.styled';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useAvailablePersonalWorkspace, useTranslation } from 'hooks';

import { KratosRoutes } from 'services/oryServices/kratos';
import { getPlanType } from 'services/userServices';

import { multilingualUtils, avatar as avatarUtils } from 'utils';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { MAX_ACCESS_ORG_DISPLAY, ORG_TEXT } from 'constants/organizationConstants';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { Colors } from 'constants/styles';
import { AUTH_SERVICE_URL } from 'constants/urls';

import useLastAccessOrg from './hooks/useLastAccessOrg';

import * as Styled from './SidebarOwnerPane.styled';

const propTypes = {
  owner: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  organizationList: PropTypes.object,
  closePopper: PropTypes.func,
  mainOrganization: PropTypes.object,
};
const defaultProps = {
  organizationList: {},
  closePopper: () => {},
  mainOrganization: {},
};

function SidebarOwnerPane({ owner, currentUser, organizationList, closePopper, mainOrganization }) {
  const navigate = useNavigate();
  const isPersonalPane = owner._id === currentUser._id;
  const { data: organizationsData, loading } = organizationList || {};
  const orgList = organizationsData || [];
  const { t } = useTranslation();
  const { closeMenu } = useContext(HamburgerContext) || {};
  const organizations = useLastAccessOrg(orgList);
  const isAvailablePersonalWorkspace = useAvailablePersonalWorkspace();

  const isActive = (item) => owner._id === item._id;

  const getPlanDescription = (item) => {
    if (item._id === currentUser._id) {
      const {
        payment: { type },
      } = getPlanType(currentUser, orgList);

      return multilingualUtils.getPlanDescription({ t, type });
    }
    const { payment } = item;
    const isTrial = payment.status === PaymentStatus.TRIALING;
    if (isTrial) {
      return t('sidebar.sidebarOwnerPane.planTrialDescription', { planType: PLAN_TYPE_LABEL[payment.type] });
    }
    return multilingualUtils.getPlanDescription({ t, type: payment.type });
  };
  const { _id: orgId, name, avatarRemoteId, joinStatus } = mainOrganization;
  const isExistOrgCanRequest = Boolean(name);
  const hasCircle = orgList.length > 0;
  const handleOnclickItem = () => {
    closePopper();
  };
  const renderListItem = ({
    _id,
    url,
    avatarRemoteId,
    defaultAvatar,
    variant,
    name,
    active,
    planDescription,
    onItemClick = () => {},
  }) => (
    <Styled.ListItem key={_id} to={url} onClick={onItemClick} isActive={active}>
      <MaterialAvatar
        src={avatarUtils.getAvatar(avatarRemoteId)}
        size={32}
        variant={variant}
        hasBorder
        secondary={typeof defaultAvatar !== 'string'}
      >
        {defaultAvatar}
      </MaterialAvatar>
      <Styled.ItemBody>
        <Tooltip title={name} enterDelay={1000} enterNextDelay={1000}>
          <LeftSidebarStyled.Title>{name}</LeftSidebarStyled.Title>
        </Tooltip>
        <LeftSidebarStyled.Text>{planDescription}</LeftSidebarStyled.Text>
      </Styled.ItemBody>
      {active && <Icomoon className="check" size={14} color={Colors.PRIMARY_90} />}
    </Styled.ListItem>
  );

  const renderPersonalAccount = () =>
    renderListItem({
      _id: currentUser._id,
      url: '/documents',
      avatarRemoteId: currentUser.avatarRemoteId,
      defaultAvatar: avatarUtils.getTextAvatar(currentUser.name),
      variant: 'circular',
      name: currentUser.name,
      active: isActive(currentUser),
      planDescription: getPlanDescription(currentUser),
      onItemClick: handleOnclickItem,
    });

  const renderOrganizationItems = () =>
    organizations.slice(0, MAX_ACCESS_ORG_DISPLAY).map(({ organization }) =>
      renderListItem({
        _id: organization._id,
        url: `/${ORG_TEXT}/${organization.url}/documents`,
        avatarRemoteId: organization.avatarRemoteId,
        defaultAvatar: <Icomoon className="default-org-2" size={18} color={Colors.NEUTRAL_60} />,
        variant: 'circular',
        name: organization.name,
        active: isActive(organization),
        planDescription: getPlanDescription(organization),
        onItemClick: handleOnclickItem,
      })
    );

  const renderCreateOrgButton = () =>
    !hasCircle && (
      <>
        <Styled.Divider />
        <Styled.Bottom>
          <Styled.CreateOrgContainer>
            <Styled.DescriptionContainer>
              <Styled.NewOrganizationIcon>
                <Icomoon className="organization-default" size={16} color={Colors.SECONDARY_50} />
              </Styled.NewOrganizationIcon>
              <Styled.Description>{t('sidebar.sidebarOwnerPane.descriptionCreateOrg')}</Styled.Description>
            </Styled.DescriptionContainer>
            <Styled.ButtonCreateOrg>
              <Styled.ButtonContent to={`/${ORG_TEXT}/create`}>
                <Icomoon className="plus-thin" size={15} color={Colors.SECONDARY_50} />
                <Styled.ButtonText>{t('sidebar.sidebarOwnerPane.createOrg')}</Styled.ButtonText>
              </Styled.ButtonContent>
            </Styled.ButtonCreateOrg>
          </Styled.CreateOrgContainer>
        </Styled.Bottom>
      </>
    );

  const renderBottomPane = () => {
    const canDisplayMoreOrgs = orgList.length > MAX_ACCESS_ORG_DISPLAY;
    return (
      <>
        {canDisplayMoreOrgs && (
          <Styled.MoreOrganizations to={`/${ORG_TEXT}s`} onClick={closePopper}>
            <Styled.MoreText>{t('common.more')}</Styled.MoreText>
            <Icomoon className="arrow-right" size={16} color={Colors.NEUTRAL_60} />
          </Styled.MoreOrganizations>
        )}
        {orgList.length ? (
          <>
            <Styled.Divider />
            <Styled.Bottom spaceTop={!canDisplayMoreOrgs}>
              <Styled.Link to={`/${ORG_TEXT}s`}>{t('sidebar.sidebarOwnerPane.manageOrg')}</Styled.Link>
            </Styled.Bottom>
          </>
        ) : (
          renderCreateOrgButton()
        )}
      </>
    );
  };

  const closePopperMenu = () => {
    closePopper();
    closeMenu && closeMenu();
    if (isPersonalPane) {
      window.location.href = AUTH_SERVICE_URL + getFullPathWithPresetLang(KratosRoutes.PROFILE_SETTINGS);
    } else {
      navigate(owner.settingPageUrl);
    }
  };

  return (
    <Styled.Container>
      <Styled.Header>
        {Boolean(owner.settingPageUrl.length) && (
          <Tooltip
            title={
              isPersonalPane
                ? t('sidebar.sidebarOwnerPane.tooltipSetting')
                : t('sidebar.sidebarOwnerPane.circleSetting')
            }
          >
            <Styled.Setting onClick={closePopperMenu}>
              <Icomoon className="setting" size={20} color={Colors.NEUTRAL_60} />
            </Styled.Setting>
          </Tooltip>
        )}
        <Styled.AvatarContainer>
          <MaterialAvatar
            size={40}
            src={avatarUtils.getAvatar(owner.avatarRemoteId)}
            variant={owner.variant}
            hasBorder
            secondary={typeof owner.defaultAvatar !== 'string'}
          >
            {owner.defaultAvatar}
          </MaterialAvatar>
        </Styled.AvatarContainer>
        <Tooltip title={owner.title} enterDelay={1000} enterNextDelay={1000}>
          <LeftSidebarStyled.Title hasPadding>{owner.title}</LeftSidebarStyled.Title>
        </Tooltip>
        <LeftSidebarStyled.Text>{owner.description}</LeftSidebarStyled.Text>
      </Styled.Header>
      {isAvailablePersonalWorkspace && (
        <>
          <Styled.HeaderTitle>{t('sidebar.sidebarOwnerPane.headerPersonal')}</Styled.HeaderTitle>
          {renderPersonalAccount()}
        </>
      )}
      {(Boolean(orgList.length) || isExistOrgCanRequest) && (
        <Styled.SectionHeader>
          <Styled.HeaderTitle hasOrg>{t('sidebar.sidebarOwnerPane.headerOrg').toUpperCase()}</Styled.HeaderTitle>
          <Tooltip title={t('sidebar.sidebarOwnerPane.createOrg')} position="bottom">
            <Styled.IconButton component={Link} to={`/${ORG_TEXT}/create`} iconSize={16} size={24} icon="plus-thin" />
          </Tooltip>
        </Styled.SectionHeader>
      )}
      {loading ? <Loading containerStyle={{ margin: '16px 0' }} normal /> : renderOrganizationItems()}
      {renderBottomPane()}
      {isExistOrgCanRequest && (
        <OrganizationRequestJoinItem
          orgId={orgId}
          name={name}
          avatarRemoteId={avatarRemoteId}
          joinStatus={joinStatus}
        />
      )}
    </Styled.Container>
  );
}

SidebarOwnerPane.propTypes = propTypes;
SidebarOwnerPane.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizationList: selectors.getOrganizationList(state),
  mainOrganization: selectors.getMainOrganizationCanJoin(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SidebarOwnerPane);
