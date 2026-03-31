import get from 'lodash/get';
import { useCallback, useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useMatch } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import { useTranslation } from 'hooks';

import paymentService from 'services/paymentService';

import { toastUtils } from 'utils';

import { WarningBannerType } from 'constants/banner';
import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { PaymentTypes } from 'constants/plan';

export function useRetrySubscription(clientId, type, options = null) {
  const { t } = useTranslation();
  const { loading = false, skippedWarnings = [] } = options || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contextValue = useContext(WarningBannerContext);
  const { refetch: refetchBillingWarning } = contextValue[WarningBannerType.BILLING_WARNING.value];

  const billings = useSelector(selectors.getBillingWarning, shallowEqual) || {};
  const { renewPayload: { metadata } = {} } = billings[clientId] || {};
  const orgUrl = get(metadata, 'organization.url');
  const redirectUrl =
    type === PaymentTypes.ORGANIZATION ? `/${ORG_TEXT}/${orgUrl}/dashboard/billing` : '/setting/billing';

  const isMatched = useMatch({
    path: redirectUrl,
  });

  const handleRedirect = () => {
    if (!isMatched) {
      navigate(redirectUrl);
    }
  };

  const onRetry = useCallback(async () => {
    try {
      if (loading) {
        dispatch(actions.openElement('loadingModal'));
      }
      await paymentService.retryFailedSubscription(clientId);
      handleRedirect();
      refetchBillingWarning(clientId, type, { skippedWarnings });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('orgDashboardBilling.subscriptionHasBeenRenewed'),
      });
    } catch (e) {
      dispatch(
        actions.openModal({
          type: ModalTypes.ERROR,
          title: t('orgDashboardBilling.subscriptionRenewalFails'),
          message: t('orgDashboardBilling.messageSubscriptionRenewalFails'),
          confirmButtonTitle: t('common.ok'),
          onConfirm: handleRedirect,
          confirmButtonProps: {
            withExpandedSpace: true,
          },
          useReskinModal: true,
        })
      );
      throw e;
    } finally {
      if (loading) {
        dispatch(actions.closeElement('loadingModal'));
      }
    }
  }, [clientId, type, isMatched, redirectUrl]);

  return { onRetry };
}
