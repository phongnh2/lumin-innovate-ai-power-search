import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { organizationServices } from 'services';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, PLAN_TYPE } from 'constants/plan';

export const useExpiredDocumentModal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);
  const { _id } = currentOrganization.data || {};

  const getPaymentRedirectUrl = () => {
    const urlSerializer = new PaymentUrlSerializer()
      .trial(false)
      .of(_id)
      .period(PERIOD.ANNUAL)
      .plan(PLAN_TYPE.ORG_PRO)
      .returnUrlParam();
    return urlSerializer.get();
  };

  const getExpiredModalContent = (document) => {
    const { isShared } = document;
    const orgOwnCurrentDoc = getOrgOfDoc({ organizations, currentDocument: document });
    const modalContent = {
      title: t('modalExpiredDocument.title'),
      confirmButtonTitle: t('action.ok'),
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };

    if (isShared) {
      return {
        ...modalContent,
        message: t('modalExpiredDocument.requestUpgradeMessage'),
      };
    }
    if (organizationServices.isManager(orgOwnCurrentDoc.userRole)) {
      return {
        title: t('modalExpiredDocument.upgradeTitle'),
        message: t('modalExpiredDocument.upgradePlanMessage'),
        confirmButtonTitle: t('common.upgrade'),
        confirmButtonProps: {},
        onCancel: () => {},
        onConfirm: () => navigate(getPaymentRedirectUrl()),
      };
    }

    return {
      ...modalContent,
      message: t('modalExpiredDocument.requestMessage'),
    };
  };

  return {
    getExpiredModalContent,
  };
};
