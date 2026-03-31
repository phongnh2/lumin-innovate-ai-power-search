import { PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useGetCustomerSupportModalFlag } from './useGetCustomerSupportModalFlag';
import { NUMBER_INVITE_TO_SHOWN_CUSTOMER_SUPPORT_MODAL } from '../constants/customConstant';

const useShowContactCustomerSupportModal = ({
  organization,
  numberInvited = 0,
}: {
  organization: IOrganization;
  numberInvited: number;
}) => {
  const { enabled: isShowCustomerSupportModal } = useGetCustomerSupportModalFlag();
  const isTrialing = organization?.payment?.status === PaymentStatus.TRIALING;
  const totalMember = organization?.totalMember ?? 0;
  const shouldOpenContactCustomerSupportModal =
    isShowCustomerSupportModal &&
    isTrialing &&
    numberInvited + totalMember >= NUMBER_INVITE_TO_SHOWN_CUSTOMER_SUPPORT_MODAL;

  return { shouldOpenContactCustomerSupportModal };
};

export { useShowContactCustomerSupportModal };
