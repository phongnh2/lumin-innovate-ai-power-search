import React, { useEffect, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation, useNavigateUser, useEnableWebReskin } from 'hooks';

import * as organizationGraphService from 'services/graphServices/organization';

import { ModalTypes } from 'constants/lumin-common';

const withRemoveOrganizationMember = (WrappedComponent) => (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { isEnableReskin } = useEnableWebReskin();
  const { goToOrgListOrPersonalDocs } = useNavigateUser();

  const organizationId = currentOrganization?.data?._id;

  const subscriptionRemoveOrgMember = useCallback(() => organizationGraphService.removeOrgMemberSubscription({
    orgId: organizationId,
    callback: ({ organization: orgData }) => {
      const handleConfirm = () => {
        dispatch(actions.removeOrganizationInListById(organizationId));
        goToOrgListOrPersonalDocs({ forceReload: true });
      };
      const modalData = {
        title: t('orgPage.permissionIsExpired'),
        message: (
          <h3>
            <Trans i18nKey="orgPage.removedFromOrg" values={{ orgName: orgData?.name }} components={{ b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} /> }} />
          </h3>
        ),
        type: ModalTypes.WARNING,
        isFullWidthButton: !isEnableReskin,
        confirmButtonTitle: t('common.ok'),
        onConfirm: handleConfirm,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
        confirmButtonProps: {
          withExpandedSpace: true,
        },
      };
      dispatch(actions.openModal(modalData));
    },
  }), [dispatch, organizationId, location, navigate]);

  useEffect(() => {
    const subscriptionRemoveOrgMemberObserver = subscriptionRemoveOrgMember(organizationId);
    return () => subscriptionRemoveOrgMemberObserver.unsubscribe();
  }, [organizationId, subscriptionRemoveOrgMember]);

  return <WrappedComponent {...props} />;
};

export default withRemoveOrganizationMember;
