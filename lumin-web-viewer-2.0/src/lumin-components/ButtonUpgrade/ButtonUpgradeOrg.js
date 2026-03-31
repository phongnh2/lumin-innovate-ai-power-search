import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PERIOD } from 'constants/plan';
import { ORG_TEXT } from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';
import selectors from 'selectors';
import { organizationServices } from 'services';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { t } from 'i18next';

const ButtonUpgradeOrg = ({ currentOrganization, renderButton }) => {
  const { url, userRole } = currentOrganization || {};
  const isManager = organizationServices.isManager(userRole);

  if (!isManager) {
    return null;
  }
  return renderButton({
    text: t('common.upgradeNow'),
    to: `/${ORG_TEXT}/${url}/plans?${UrlSearchParam.PLAN_PERIOD}=${PERIOD.ANNUAL.toLowerCase()}`,
    buttonName: ButtonName.ORG_PLAN_UPGRADE,
    buttonPurpose: ButtonPurpose[ButtonName.ORG_PLAN_UPGRADE],
  });
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state).data,
});

ButtonUpgradeOrg.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  renderButton: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(ButtonUpgradeOrg);
