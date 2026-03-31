import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { matchPath, useLocation } from 'react-router';

import selectors from 'selectors';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';

import ButtonUpgradeOrg from './ButtonUpgradeOrg';

import * as Styled from './ButtonUpgrade.styled';

const ButtonUpgrade = ({ currentOrganization, disabled }) => {
  const location = useLocation();
  const organizationRouteMatch = ORGANIZATION_ROUTERS.some((route) => matchPath({ path: route }, location.pathname));

  const onUpgradeClick = (e) => {
    if (disabled) {
      e.preventDefault();
    }
  };

  const renderButton = ({
    text, to, buttonName, buttonPurpose,
  }) => (
    <Styled.ButtonUpgrade
      data-lumin-btn-name={buttonName}
      data-lumin-btn-purpose={buttonPurpose}
      to={to}
      onClick={onUpgradeClick}
      $disabled={disabled}
    >
      <Styled.StyleIcon className="icon-crown" />
      <Styled.TextUpgrade>{text}</Styled.TextUpgrade>
    </Styled.ButtonUpgrade>
  );
  if (organizationRouteMatch && currentOrganization.data) {
    return <ButtonUpgradeOrg renderButton={renderButton} />;
  }
  return null;
};

ButtonUpgrade.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

ButtonUpgrade.defaultProps = {
  disabled: false,
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(ButtonUpgrade);
