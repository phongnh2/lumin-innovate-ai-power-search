import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SidebarOwnerInfo from 'lumin-components/SidebarOwnerInfo';

import { useAvailablePersonalWorkspace, useTranslation } from 'hooks';

import { getPlanType } from 'services/userServices';

import { avatar as avatarUtils, multilingualUtils } from 'utils';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  organizations: PropTypes.object.isRequired,
  isOffline: PropTypes.bool.isRequired,
};
const defaultProps = {
};

function SidebarPersonalInfo({
  currentUser,
  organizations,
  isOffline,
}) {
  const isAvailable = useAvailablePersonalWorkspace();
  const { t } = useTranslation();
  const { payment: { type } } = getPlanType(currentUser, organizations.data || []);
  const owner = {
    _id: currentUser._id,
    avatarRemoteId: currentUser.avatarRemoteId,
    title: currentUser.name,
    description: !organizations.loading ? multilingualUtils.getPlanDescription({ t, type }) : '',
    defaultAvatar: avatarUtils.getTextAvatar(currentUser.name),
    variant: 'circular',
    settingPageUrl: '/setting/profile',
  };
  return (
    <SidebarOwnerInfo loading={!isOffline && !isAvailable} owner={owner} />
  );
}

SidebarPersonalInfo.propTypes = propTypes;
SidebarPersonalInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizations: selectors.getOrganizationList(state),
  isOffline: selectors.isOffline(state),
});

export default connect(mapStateToProps)(SidebarPersonalInfo);
