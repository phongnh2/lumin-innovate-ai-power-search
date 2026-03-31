import produce from 'immer';
import { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import { useTranslation } from 'hooks';

import { paymentServices, organizationServices } from 'services';

import { toastUtils } from 'utils';

import { WarningBannerType } from 'constants/banner';
import { ModalTypes } from 'constants/lumin-common';
import { MESSAGE_REACTIVATED_PAYMENT } from 'constants/messages';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { ORG_TEXT } from 'constants/organizationConstants';
import { PaymentTypes } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

export default function useReactivateSubscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contextValue = useContext(WarningBannerContext);
  const { refetch } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const { t } = useTranslation();

  const openLoading = () => dispatch(actions.openElement('loadingModal'));
  const closeLoading = () => dispatch(actions.closeElement('loadingModal'));
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) || {};
  const setCurrentUser = (user) => dispatch(actions.setCurrentUser(user));
  const updateOrganizationInList = (id, data) => dispatch(actions.updateOrganizationInList(id, data));

  const _updateClient = ({ payment, type, resourceId }) => {
    switch (type) {
      case PaymentTypes.INDIVIDUAL: {
        const updatedUser = produce(currentUser, (draftUser) => {
          draftUser.payment = payment;
        });
        setCurrentUser(updatedUser);
        break;
      }
      case PaymentTypes.ORGANIZATION: {
        updateOrganizationInList(resourceId, {
          payment,
        });
        break;
      }
      default:
        break;
    }
  };

  const reactiveSubscription = async (type, resourceId, subCancelMetaData) => {
    const { organization } = subCancelMetaData || {};
    openLoading();
    const isReactiveIndividualPlan = type !== PaymentTypes.ORGANIZATION;
    try {
      const response = isReactiveIndividualPlan
        ? await paymentServices.reactivateSubscription()
        : await organizationServices.reactivateUnifyOrganizationSubscription({
            orgId: resourceId,
            productsToReactivate: [{ productName: UnifySubscriptionProduct.PDF }],
          });
      _updateClient({ payment: response.data, type, resourceId });
      if (isReactiveIndividualPlan) {
        refetch(resourceId, PaymentTypes.INDIVIDUAL);
        window.open(`${BASEURL}${Routers.SETTINGS.BILLING}`, '_blank');
      } else {
        refetch(resourceId, PaymentTypes.ORGANIZATION);
        dispatch(actions.fetchCurrentOrganization(organization.url));
        navigate(`/${ORG_TEXT}/${organization.url}/dashboard/billing`);
      }
      const modalData = {
        type: ModalTypes.SUCCESS,
        title: t('orgDashboardBilling.reactivateSuccessfully'),
        message: t(MESSAGE_REACTIVATED_PAYMENT),
        onConfirm: () => {},
        confirmButtonTitle: t('common.ok'),
        isFullWidthButton: true,
      };
      dispatch(actions.openModal(modalData));
    } catch (err) {
      toastUtils.openToastMulti({
        message: t('viewer.billingWarning.failedToCloseTheBanner'),
        type: ModalTypes.ERROR,
      });
    } finally {
      closeLoading();
    }
  };

  return { reactiveSubscription };
}
