import { isNil, merge } from 'lodash';
import { useContext, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import ViewerContext from 'screens/Viewer/Context';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { organizationServices, paymentServices } from 'services';
import organizationTracking from 'services/awsTracking/organizationTracking';

import logger from 'helpers/logger';

import { paymentUtil, toastUtils } from 'utils';
import { PaymentUrlSerializer } from 'utils/payment';

import { LOGGER } from 'constants/lumin-common';
import { PaymentCurrency, PaymentPeriod, PaymentPlans, PaymentStatus, PaymentTypes } from 'constants/plan.enum';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IChargeData, ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

type Params = {
  currentOrganization: IOrganization;
  onClose: () => void;
};

const useReactivateCanceledCircle = ({ currentOrganization, onClose }: Params) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fetchingCard, setFetchingCard] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const { _id: orgId } = currentOrganization || {};
  const { isViewer } = useViewerMatch();
  const { refetchDocument } = useContext(ViewerContext);

  const redirectToPaymentPage = () => {
    const paymentUrlSerializer = new PaymentUrlSerializer();
    const url = paymentUrlSerializer
      .of(orgId)
      .plan(PaymentPlans.ORG_PRO)
      .period(PaymentPeriod.MONTHLY)
      .returnUrlParam()
      .get();
    navigate(url);
  };

  const updateOrgInViewer = (orgData: IOrganization) => {
    refetchDocument((document: IDocumentBase) =>
      dispatch(
        actions.setCurrentDocument({
          ...document,
          documentReference: {
            ...document.documentReference,
            data: orgData,
          },
        })
      )
    );
  };

  const updateOrg = (orgData: IOrganization) => {
    batch(() => {
      dispatch(actions.updateCurrentOrganization(orgData));
      dispatch(actions.updateOrganizationInList(orgId, orgData));
    });
    if (isViewer) {
      updateOrgInViewer(orgData);
    }
  };

  const getUpdatedOrgData = ({ newPaymentData }: { newPaymentData: IChargeData }): IOrganization => {
    const { payment, docStackStorage, settings } = currentOrganization;
    const { autoUpgrade: prevAutoUpgrade } = settings;

    const calcNextStackPayload = {
      quantity: 0,
      nextPlan: PaymentPlans.ORG_PRO,
      nextPeriod: PaymentPeriod.MONTHLY,
      currentStatus: payment.status as PaymentStatus,
      currentPeriod: payment.period as PaymentPeriod,
      currentPlan: payment.type,
      totalDocStackUsed: docStackStorage?.totalUsed || 0,
    };
    const { nextDocStack } = paymentUtil.getNextDocStack(calcNextStackPayload);
    return {
      ...currentOrganization,
      payment: merge({}, payment, newPaymentData),
      settings: {
        ...settings,
        autoUpgrade: isNil(prevAutoUpgrade) ? true : prevAutoUpgrade,
      },
      docStackStorage: {
        ...docStackStorage,
        totalStack: nextDocStack,
      },
    };
  };

  const chargeNewSubscription = async (): Promise<void> => {
    setIsCharging(true);
    try {
      const result = await organizationServices.createOrganizationSubscription(orgId, {
        couponCode: '',
        currency: PaymentCurrency.USD,
        period: PaymentPeriod.MONTHLY,
        plan: PaymentPlans.ORG_PRO,
        quantity: 0,
      });
      const updatedOrg = getUpdatedOrgData({ newPaymentData: result });
      updateOrg(updatedOrg);
      toastUtils.success({
        message: 'Renew subscription successfully.',
      });
      organizationTracking.trackReactivateCanceledCircle({
        organizationId: orgId,
        customerRemoteId: result.customerRemoteId,
        subscriptionRemoteId: result.subscriptionRemoteId,
        planRemoteId: result.planRemoteId,
      });
    } catch (err) {
      toastUtils.error({
        message: 'Failed to reactivate your subscription.',
      });
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        message: 'Failed to charge new subscription.',
        error: err as Error,
      });
      redirectToPaymentPage();
    } finally {
      setIsCharging(false);
      onClose();
    }
  };

  const fetchCurrentCard = async (): Promise<{ paymentMethod: IPaymentMethod; customerInfo: ICustomerInfo }> => {
    setFetchingCard(true);
    try {
      const [paymentMethod, customerInfo] = await paymentServices.getPaymentMethodAndCustomerInfo({
        clientId: orgId,
        type: PaymentTypes.ORGANIZATION,
        fetchOptions: null,
      });
      return { paymentMethod, customerInfo };
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        message: 'Failed to fetch card details.',
        error: err as Error,
      });
      return { paymentMethod: null, customerInfo: null };
    } finally {
      setFetchingCard(false);
    }
  };

  const reactivate = async () => {
    const { paymentMethod, customerInfo } = await fetchCurrentCard();
    if (!paymentMethod || !customerInfo) {
      onClose();
      redirectToPaymentPage();
      return;
    }

    await chargeNewSubscription();
  };

  return { loading: fetchingCard || isCharging, reactivate };
};

export default useReactivateCanceledCircle;
