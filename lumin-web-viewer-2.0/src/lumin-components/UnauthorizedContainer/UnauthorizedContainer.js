import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { LocationType } from 'constants/locationConstant';

import NoPermission from './NoPermission';

const getContent = (t) => ({
  [LocationType.ORGANIZATION]: {
    title: t('noPermissionOrganization.title'),
    message: t('noPermissionOrganization.message'),
    backBtn: t('noPermissionOrganization.backBtn'),
  },
  [LocationType.ORGANIZATION_TEAM]: {
    title: t('noPermissionTeam.title'),
    message: t('noPermissionTeam.message'),
    backBtn: t('noPermissionTeam.backBtn'),
  },
});

const UnauthorizedContainer = ({ type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orgName: orgUrl } = useParams();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { t } = useTranslation();

  const handleOnClick = () => {
    const isLastAccessOrgWithoutPermission = currentUser.lastAccessedOrgUrl === orgUrl;
    if (isLastAccessOrgWithoutPermission) {
      dispatch(actions.updateLastAccessOrg());
    }
    navigate('/');
  };

  const { title, message, backBtn } = getContent(t)[type];

  useEffect(() => {
    dispatch(actions.fetchOrganizations());
  }, []);

  return <NoPermission onBack={handleOnClick} title={title} message={message} backButtonLabel={backBtn} />;
};

UnauthorizedContainer.propTypes = {
  type: PropTypes.string.isRequired,
};

export default UnauthorizedContainer;
