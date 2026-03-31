import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SidebarOwnerInfo from 'lumin-components/SidebarOwnerInfo';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { multilingualUtils } from 'utils';

import { ORG_TEXT } from 'constants/organizationConstants';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

const propTypes = {
  currentOrganization: PropTypes.object.isRequired,
};
const defaultProps = {
};

function SidebarOrgInfo({
  currentOrganization: { data: currentOrg, loading },
}) {
  const { t } = useTranslation();
  let owner = {};

  if (currentOrg) {
    const {
      payment, avatarRemoteId, name, userRole = '', _id, url,
    } = currentOrg;
    const isTrial = payment.status === PaymentStatus.TRIALING;
    owner = {
      _id,
      avatarRemoteId,
      title: name,
      description: isTrial
        ? t('sidebar.sidebarOwnerPane.planTrialDescription', { planType: PLAN_TYPE_LABEL[payment.type] })
        : multilingualUtils.getPlanDescription({ t, type: payment.type }),
      defaultAvatar: <Icomoon className="default-org-2" size={18} color={Colors.NEUTRAL_60} />,
      variant: 'circular',
      settingPageUrl: organizationServices.isManager(userRole) ? `/${ORG_TEXT}/${url}/dashboard/settings` : '',
    };
  }

  return (
    <SidebarOwnerInfo owner={owner} loading={loading} />
  );
}

SidebarOrgInfo.propTypes = propTypes;
SidebarOrgInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(SidebarOrgInfo);
