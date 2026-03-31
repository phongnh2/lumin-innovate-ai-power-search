import React, { useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useEnableWebReskin, useTranslation } from 'hooks';

import * as organizationGraphService from 'services/graphServices/organization';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_ROLE_TEXT, ORG_TRANSFER_URL } from 'constants/organizationConstants';

import './withUpdateOrganizationMemberRole.scss';

const withUpdateOrganizationMemberRole = (WrappedComponent) => (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { _id: organizationId, userRole } = currentOrganization?.data || {};
  const { tab } = useParams();
  const { isEnableReskin } = useEnableWebReskin();
  const subscriptionUpdateOrgMemberRole = useCallback(() => organizationGraphService.updateOrgMemberRoleSubscription({
    orgId: organizationId,
    callback: ({
      userId: resUserId,
      orgId: resOrgId,
      actorName,
      role: targetRole,
    }) => {
      const shouldOpenReloadModal = organizationId === resOrgId && resUserId === currentUser._id;
      if (userRole === targetRole || !shouldOpenReloadModal) {
        return;
      }
      const orgRole = t(ORGANIZATION_ROLE_TEXT[targetRole?.toUpperCase()]);
      const modalData = {
        title: t('orgPage.permissionUpdated'),
        message: (
          <h3>
            <Trans i18nKey="orgPage.changeToRole" components={{ b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} /> }} values={{ orgRole, actorName }} />
          </h3>
        ),
        type: ModalTypes.WARNING,
        isFullWidthButton: !isEnableReskin,
        confirmButtonTitle: t('common.reload'),
        onConfirm: () => window.location.reload(),
        className: 'withUpdateOrganizationMemberRole__CustomModal',
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
      };
      dispatch(actions.openModal(modalData));
    },
  }), [
    currentUser._id,
    dispatch,
    organizationId,
    userRole,
  ]);

  // unsubscribe when change org or switch org team to org document list.
  useEffect(() => {
    let subscriptionUpdateOrgMemberRoleObserver = { unsubscribe: () => {} };
    if (tab !== ORG_TRANSFER_URL) {
      subscriptionUpdateOrgMemberRoleObserver = subscriptionUpdateOrgMemberRole();
    }
    return () => subscriptionUpdateOrgMemberRoleObserver.unsubscribe();
  }, [subscriptionUpdateOrgMemberRole, tab]);

  return <WrappedComponent {...props} />;
};

export default withUpdateOrganizationMemberRole;
