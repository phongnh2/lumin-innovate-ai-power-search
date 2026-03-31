import React, { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import useUpdateOrgPayment from 'lumin-components/BillingDetail/hooks/useUpdateOrgPayment';

import { WarningBannerContext } from 'HOC/withWarningBanner';

import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { paymentServices } from 'services';

import errorExtract from 'utils/error';
import paymentEvent from 'utils/Factory/EventCollection/PaymentEventCollection';
import { PaymentUtilities } from 'utils/Factory/Payment';

import useGetCancelSubProduct from 'features/CNC/hooks/useGetCancelSubProduct';

import { SUBSCRIPTION_CANCELED_REASON } from 'constants/awsEvents';
import { WarningBannerType } from 'constants/banner';
import { TOTAL_DOC_STACK_FREE_ORG } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentPeriod, PaymentPlans, PaymentTypes } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

type Props = {
  organization: IOrganization;
};

type Actions = {
  cancelPlan: () => Promise<void>;
  isRestrictedOrg: boolean;
};

function useCancelSubscription({ organization }: Props): Actions {
  const { t } = useTranslation();
  const { _id: orgId, payment } = organization;
  const dispatch = useDispatch();
  const contextValue = useContext(WarningBannerContext);
  const { refetch } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const { subscriptionRemoteId: subscriptionId } = payment;
  const { cancelUnifySubscriptionItems } = useGetCancelSubProduct();
  const { updateOrganizationPayment } = useUpdateOrgPayment({ organization });

  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: organization?._id });

  const updateDocStackAfterCancelTrial = (): void => {
    const data = {
      docStackStorage: {
        totalStack: TOTAL_DOC_STACK_FREE_ORG,
        totalUsed: 0,
      },
    };

    batch(() => {
      dispatch(actions.updateCurrentOrganization(data));
      dispatch(actions.updateOrganizationInList(orgId, data));
    });
  };

  async function cancelPlan(): Promise<void> {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    const paymentUtils = new PaymentUtilities(payment);
    try {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
        })
      );
      let response: { data: IOrganizationPayment };
      if (paymentUtils.isFreeTrial()) {
        response = await paymentServices.cancelOrganizationFreeTrial(orgId);
        updateDocStackAfterCancelTrial();
      } else {
        response = await paymentServices.cancelUnifySubscription({
          clientId: orgId,
          type: PaymentTypes.ORGANIZATION,
          subscriptionItems: cancelUnifySubscriptionItems,
        });
      }
      updateOrganizationPayment(response.data);
      refetch(orgId, PaymentTypes.ORGANIZATION);
      dispatch(actions.fetchCurrentOrganization(organization.url));
      paymentEvent
        .subscriptionCanceled({
          subscriptionId,
          reason: SUBSCRIPTION_CANCELED_REASON.CANCELED_ON_UI,
        })
        .catch(() => {});
    } catch (error) {
      const { code, message, metadata } = errorExtract.extractGqlError(error) as {
        code: string;
        message: string;
        metadata: { plan: keyof typeof PLAN_TYPE_LABEL; docStack: number; period: PaymentPeriod };
      };

      if (code === ErrorCode.Org.UPGRADING_INVOICE) {
        const modalSetting = {
          type: ModalTypes.WARNING,
          title: t('modalChangingPlan.title'),
          message:
            metadata.plan === PaymentPlans.ENTERPRISE ? (
              <Trans
                i18nKey="modalChangingPlan.message"
                values={{ plan: PLAN_TYPE_LABEL[metadata.plan] }}
                components={{ b: <b className="kiwi-message--primary" /> }}
              />
            ) : (
              <Trans
                i18nKey="modalChangingPlan.message"
                values={{
                  plan: PLAN_TYPE_LABEL[metadata.plan],
                  period:
                    metadata.period === PaymentPeriod.MONTHLY ? t('freeTrialPage.monthly') : t('freeTrialPage.annual'),
                  docStack: metadata.docStack,
                }}
                components={{ b: <b className="kiwi-message--primary" /> }}
              />
            ),
          confirmButtonTitle: t('common.ok'),
          useReskinModal: true,
          confirmButtonProps: {
            withExpandedSpace: true,
          },
        };

        dispatch(actions.openModal(modalSetting));
      } else {
        dispatch(
          actions.openModal({
            type: ModalTypes.ERROR,
            title: t('common.failed'),
            confirmButtonTitle: t('common.ok'),
            message,
            onConfirm: () => window.location.reload(),
            useReskinModal: true,
            confirmButtonProps: {
              withExpandedSpace: true,
            },
          })
        );
      }
    }
  }

  return {
    cancelPlan,
    isRestrictedOrg,
  };
}

export default useCancelSubscription;
