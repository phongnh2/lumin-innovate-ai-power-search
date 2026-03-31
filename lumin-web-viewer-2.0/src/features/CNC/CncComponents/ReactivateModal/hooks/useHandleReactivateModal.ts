import useOrgBillingAction from 'luminComponents/BillingDetail/hooks/useOrgBillingAction';

import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { Plans, STATUS } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useReactivateCanceledCircle from './useReactivateCanceledCircle';

type Params = {
  currentOrganization: IOrganization;
  onClose: () => void;
};

const useHandleReactivateModal = ({ currentOrganization, onClose }: Params) => {
  const { payment } = currentOrganization || {};
  const { type: paymentType, status: paymentStatus, customerRemoteId, subscriptionItems } = payment || {};
  const pdfSubscriptionItem = subscriptionItems?.find(
    (subItem) => subItem.productName === UnifySubscriptionProduct.PDF
  );
  const isOrgCanceledPlan =
    (paymentType === Plans.FREE || pdfSubscriptionItem?.paymentType === Plans.FREE) && Boolean(customerRemoteId);
  const isSetToCancelOrg =
    paymentStatus === STATUS.CANCELED || pdfSubscriptionItem?.paymentStatus === PaymentStatus.CANCELED;
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: ModalName.REACTIVATE_LUMIN_CIRCLE_SUBSCRIPTION_MODAL,
    hotjarEvent: HOTJAR_EVENT.REACTIVATE_LUMIN_CIRCLE_SUBSCRIPTION_MODAL_VIEWED,
  });
  const { reactivate: reactivateSetToCancelCircle } = useOrgBillingAction({
    organization: currentOrganization,
    isTrackEvent: true,
  });
  const { reactivate: reactivateCanceledCircle, loading } = useReactivateCanceledCircle({
    currentOrganization,
    onClose,
  });

  const getTextButton = (): string => {
    if (isOrgCanceledPlan) {
      return 'Renew subscription ($30 / month)';
    }

    if (isSetToCancelOrg) {
      return 'Renew subscription';
    }

    return '';
  };

  const onClickButton = (): void => {
    trackModalConfirmation().catch(() => {});
    if (isOrgCanceledPlan) {
      reactivateCanceledCircle().catch(() => {});
      return;
    }

    if (isSetToCancelOrg) {
      reactivateSetToCancelCircle().catch(() => {});
    }
  };

  const onCloseModal = () => {
    trackModalDismiss().catch(() => {});
    onClose();
  };

  return { onClickButton, onCloseModal, loading, getTextButton };
};

export default useHandleReactivateModal;
