import React, { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { WarningBannerContext } from 'HOC/withWarningBanner';

import { useEnableWebReskin } from 'hooks';
import useReactivateAccount from 'hooks/useReactivateAccount';
import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { organizationServices, paymentServices } from 'services';
import organizationTracking from 'services/awsTracking/organizationTracking';

import { orgUtil } from 'utils';
import errorExtract from 'utils/error';
import { getLanguage } from 'utils/getLanguage';

import { useReactivateUnifySubscriptionModal } from 'features/ReactivateUnifySubscription/hooks';

import { WarningBannerType } from 'constants/banner';
import { ErrorCode } from 'constants/errorCode';
import { LANGUAGES } from 'constants/language';
import { ModalTypes } from 'constants/lumin-common';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { ORG_TEXT, UNIFY_PRODUCTS_LABEL_MAPPING } from 'constants/organizationConstants';
import { PaymentTypes } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import {
  GetUnifySubscriptionData,
  IOrganizationPayment,
  PaymentSubScriptionItem,
  SubScriptionItemWithAmount,
} from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

import useUpdateOrgPayment from './useUpdateOrgPayment';

type Props = {
  organization: IOrganization;
  isTrackEvent?: boolean;
  cancelAction?: () => void;
  setUnifyBillingSubscriptionData?: (payload: GetUnifySubscriptionData) => void;
  productToReactivate?: UnifySubscriptionProduct;
  subscriptionItems?: SubScriptionItemWithAmount[];
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function useOrgBillingAction({
  organization,
  isTrackEvent,
  cancelAction,
  setUnifyBillingSubscriptionData,
  productToReactivate = UnifySubscriptionProduct.PDF,
  subscriptionItems = [],
}: Props) {
  const { t } = useTranslation();
  const { updateOrganizationPayment } = useUpdateOrgPayment({ organization });
  const { _id: orgId } = organization;
  const dispatch = useDispatch();
  const contextValue = useContext(WarningBannerContext);
  const { refetch } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const navigate = useNavigate();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

  const { isEnableReskin } = useEnableWebReskin();
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: organization?._id });
  const { render: renderReactivateUnifySubscriptionModal, toggle: toggleReactivateUnifySubscriptionModal } =
    useReactivateUnifySubscriptionModal({
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      onReactivate: reactivatePlan,
      organization,
      productToReactivate,
      subscriptionItems,
    });

  const language = getLanguage();

  const openSuccessModal = ({ title, message }: { title: string; message: React.ReactNode }) => {
    const modalData = {
      type: isEnableReskin ? null : ModalTypes.SUCCESS,
      title,
      message,
      onConfirm: () => {},
      confirmButtonTitle: t('common.ok'),
      isFullWidthButton: !isEnableReskin,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
      closeOnRouteChange: true,
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };
    dispatch(actions.openModal(modalData));
  };

  const { openReactivateModal } = useReactivateAccount({ organization });

  const trackEventReactivate = (data: IOrganizationPayment): void => {
    if (!isTrackEvent) {
      return;
    }

    organizationTracking.trackReactivateSetToCancelCircle({
      organizationId: orgId,
      customerRemoteId: data.customerRemoteId,
      subscriptionRemoteId: data.subscriptionRemoteId,
      planRemoteId: data.planRemoteId,
    });
  };

  async function reactivatePlan(selectedProducts: Pick<PaymentSubScriptionItem, 'productName'>[] = []): Promise<void> {
    try {
      dispatch(actions.openElement('loadingModal'));
      const productsToReactivate = selectedProducts.length ? selectedProducts : [{ productName: productToReactivate }];
      const products = productsToReactivate.map((product) => UNIFY_PRODUCTS_LABEL_MAPPING[product.productName]).join(', ');
      const { data } = await organizationServices.reactivateUnifyOrganizationSubscription({
        orgId,
        productsToReactivate,
      });
      const unifySubscriptionData = await paymentServices.getUnifySubscription({
        clientId: orgId,
        type: PaymentTypes.ORGANIZATION,
      });
      setUnifyBillingSubscriptionData(unifySubscriptionData);
      trackEventReactivate(data);
      batch(() => {
        updateOrganizationPayment(data);
        refetch(orgId, PaymentTypes.ORGANIZATION);
        openSuccessModal({
          title: t('orgDashboardBilling.reactivateSuccessfully'),
          message: (
            <Trans
              i18nKey="reactivateUnifySubscriptionModal.withProductSuccessContent"
              components={{ b: <b className="kiwi-message--primary" /> }}
              values={{
                products,
                ...(language === LANGUAGES.EN && { be: t('pluralBe', { count: productsToReactivate.length }) }),
              }}
            />
          ),
        });
        dispatch(actions.closeElement('loadingModal'));
        if (selectedProducts.length) {
          toggleReactivateUnifySubscriptionModal();
        }
      });
    } catch (e) {
      const { code: errorCode } = errorExtract.extractGqlError(e);
      dispatch(actions.closeElement('loadingModal'));

      if (errorCode === ErrorCode.Org.SCHEDULED_DELETE) {
        const { userRole, name: orgName, deletedAt } = organization;
        const modalSetting = orgUtil.getScheduledDeleteOrgModalSettings({ userRole, orgName, deletedAt }, async () => {
          await organizationServices.reactiveOrganization(orgId);
          refetch(orgId, PaymentTypes.ORGANIZATION);
        });
        dispatch(actions.openModal(modalSetting));
      } else {
        dispatch(
          actions.openModal({
            type: isEnableReskin ? ModalTypes.WARNING : ModalTypes.ERROR,
            title: t('orgDashboardBilling.reactivateFailed'),
            confirmButtonTitle: t('common.ok'),
            message: t('payment.planReactivationFailed'),
            onConfirm: () => {},
            useReskinModal: true,
            confirmButtonProps: {
              withExpandedSpace: true,
            },
          })
        );
      }
    }
  }

  const beforeReactivatePlan = async (): Promise<void> => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    if (currentUser.deletedAt) {
      openReactivateModal();
      return;
    }
    const hasMultipleCanceledSubscriptions =
      organization.payment.subscriptionItems?.filter((subItem) => subItem.paymentStatus === PaymentStatus.CANCELED)
        ?.length >= 2;

    if (hasMultipleCanceledSubscriptions) {
      toggleReactivateUnifySubscriptionModal();
      return;
    }

    await reactivatePlan();
  };

  const navigateToCancelPage = () => {
    navigate(`/${ORG_TEXT}/${organization.url}/subscription/survey`);
  };

  const getCancelAction = () => {
    if (isRestrictedOrg) {
      return openRestrictActionsModal;
    }
    if (cancelAction) {
      return cancelAction;
    }
    return navigateToCancelPage;
  };

  return {
    reactivate: beforeReactivatePlan,
    cancel: getCancelAction(),
    renderReactivateUnifySubscriptionModal,
  };
}

export default useOrgBillingAction;
