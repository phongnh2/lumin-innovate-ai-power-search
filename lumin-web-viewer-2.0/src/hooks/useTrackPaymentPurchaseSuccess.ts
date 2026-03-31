import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { LocalStorageKey } from 'constants/localStorageKey';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { PaymentChargeData } from 'interfaces/payment/payment.interface';

import useGetOrganizationList from './useGetOrganizationList';

type CustomEventDetail = {
  isNewSubscription: boolean;
  organizationWithRole: {
    organization: IOrganization;
    role: IOrganization['userRole'];
  };
  organization: IOrganization;
  chargeData: PaymentChargeData;
};

// This hook is used for receiving custom event triggered from lumin-payment-mf
const useTrackPaymentPurchaseSuccess = () => {
  const dispatch = useDispatch();

  const { organizationList } = useGetOrganizationList();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<CustomEventDetail>;
      const { organization, organizationWithRole } = customEvent.detail;
      if (organizationWithRole) {
        dispatch(actions.setOrganizations([...organizationList, organizationWithRole]));
        dispatch(
          actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organizationWithRole.organization.url })
        );
        localStorage.setItem(LocalStorageKey.HAS_CREATED_ORGANIZATION_ON_PAYMENT_PAGE, 'true');
      } else {
        dispatch(actions.updateOrganizationInList(organization._id, organization));
      }
    };

    window.addEventListener(CUSTOM_EVENT.PAYMENT_PURCHASE_SUCCESS, handler);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.PAYMENT_PURCHASE_SUCCESS, handler);
    };
  }, []);
};

export default useTrackPaymentPurchaseSuccess;
