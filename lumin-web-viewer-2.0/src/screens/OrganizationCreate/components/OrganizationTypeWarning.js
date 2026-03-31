import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks';

import { MESSAGE_INELIGIBLE_TO_CREATE_MAIN_ORG, MESSAGE_ORG_DOMAIN_EXISTED } from 'constants/messages';
import { ORGANIZATION_DOMAIN_TYPE } from 'constants/organizationConstants';

import { StyledWarning } from '../OrganizationCreate.styled';

function OrganizationTypeWarning({ organizationTypeError, className }) {
  const { t } = useTranslation();

  const getWarningMessage = () => {
    switch (organizationTypeError) {
      case ORGANIZATION_DOMAIN_TYPE.EXISTED_DOMAIN:
        return t(MESSAGE_ORG_DOMAIN_EXISTED);
      case ORGANIZATION_DOMAIN_TYPE.BLACKLIST_DOMAIN:
      case ORGANIZATION_DOMAIN_TYPE.POPULAR_DOMAIN:
        return t(MESSAGE_INELIGIBLE_TO_CREATE_MAIN_ORG);
      case ORGANIZATION_DOMAIN_TYPE.ASSCOCIATE_DOMAIN:
        return t(MESSAGE_ORG_DOMAIN_EXISTED);
      default:
        return '';
    }
  };

  const message = getWarningMessage();
  return Boolean(message) && <StyledWarning className={className}>{message}</StyledWarning>;
}

OrganizationTypeWarning.propTypes = {
  organizationTypeError: PropTypes.oneOf(Object.values(ORGANIZATION_DOMAIN_TYPE)),
  className: PropTypes.string,
};
OrganizationTypeWarning.defaultProps = {
  organizationTypeError: null,
  className: '',
};

export default OrganizationTypeWarning;
