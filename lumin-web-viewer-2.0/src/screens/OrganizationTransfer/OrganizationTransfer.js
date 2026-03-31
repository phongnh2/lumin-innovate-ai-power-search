import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';

import ExpiredLink from 'luminComponents/ExpiredLink';
import Loading from 'luminComponents/Loading';

import { organizationServices } from 'services';

import errorExtract from 'utils/error';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { ErrorCode } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, ORG_TEXT } from 'constants/organizationConstants';

import AlreadyConfirmed from './components/AlreadyConfirmed';

const propTypes = {
  fetchOrganizations: PropTypes.func,
  currentOrganization: PropTypes.object,
  updateCurrentOrganization: PropTypes.func,
  currentUser: PropTypes.object,
};

const defaultProps = {
  fetchOrganizations: () => { },
  currentOrganization: {},
  updateCurrentOrganization: () => {},
  currentUser: {},
};

const OrganizationTransfer = ({
  fetchOrganizations, currentOrganization, currentUser, updateCurrentOrganization,
}) => {
  const { loading } = currentOrganization;
  const { search } = useLocation();
  const navigate = useNavigate();
  const { params: { orgName } } = useMatch({ path: `/${ORG_TEXT}/:orgName`, end: false });
  const [expiredToken, setExpiredToken] = useState(false);
  const [alreadyConfirmToken, setAlreadyConfirmToken] = useState(false);
  const { _id, email, name } = currentUser || {};
  const params = new URLSearchParams(search);
  const token = params.get('token');

  const validateToken = async () => {
    if (!token) {
      navigate(`/${ORG_TEXT}/${orgName}`, { replace: true });
      return;
    }
    try {
      await organizationServices.confirmOrganizationAdminTransfer({ token });
      updateCurrentOrganization({
        userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN.toLowerCase(),
        owner: {
          _id,
          name,
          email,
        },
      });
      fetchOrganizations();
      navigate(getDefaultOrgUrl({ orgUrl: orgName }));
    } catch (error) {
      const { code: errorCode } = errorExtract.extractGqlError(error);
      switch (errorCode) {
        case ErrorCode.Common.FORBIDDEN:
          navigate('/not-found', { replace: true });
          break;
        case ErrorCode.Org.TRANSFER_TOKEN_EXPIRED:
          setExpiredToken(true);
          break;
        case ErrorCode.Org.TRANSFER_ALREADY_CONFIRM:
          setAlreadyConfirmToken(true);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  if (loading) {
    return <Loading normal />;
  }

  if (expiredToken) {
    return <ExpiredLink />;
  }

  if (alreadyConfirmToken) {
    return <AlreadyConfirmed />;
  }

  return null;
};

OrganizationTransfer.propTypes = propTypes;
OrganizationTransfer.defaultProps = defaultProps;

export default OrganizationTransfer;
