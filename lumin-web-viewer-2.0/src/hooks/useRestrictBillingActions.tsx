import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ModalTypes } from 'constants/lumin-common';

import useGetCurrentOrganization from './useGetCurrentOrganization';
import useGetOrganizationList from './useGetOrganizationList';
import { useTranslation } from './useTranslation';

type UseRestrictBillingActionsProps = {
  orgId?: string;
};

const useRestrictBillingActions = ({ orgId }: UseRestrictBillingActionsProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { organizationList } = useGetOrganizationList();
  const currentOrg = useGetCurrentOrganization();

  const foundOrg = useMemo(() => {
    if (!orgId) {
      return currentOrg;
    }
    return organizationList.find((org) => org.organization._id === orgId)?.organization || currentOrg;
  }, [organizationList, currentOrg, orgId]);

  const openRestrictActionsModal = () => {
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('modalExpiredDocument.title'),
        confirmButtonTitle: t('common.ok'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
        onConfirm: () => {},
        confirmButtonProps: {
          withExpandedSpace: true,
        },
        closeOnRouteChange: true,
        isFullWidthButton: false,
        message: (
          <Trans
            i18nKey="orgDashboardBilling.restrictedBillingActions"
            components={{
              br: <br />,
            }}
          />
        ),
      })
    );
  };

  return {
    isRestrictedOrg: Boolean(foundOrg?.isRestrictedBillingActions),
    openRestrictActionsModal,
  };
};

export default useRestrictBillingActions;
