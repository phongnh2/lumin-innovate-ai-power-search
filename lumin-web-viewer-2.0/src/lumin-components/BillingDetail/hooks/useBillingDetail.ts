/* eslint-disable no-void */
import { useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import paymentService from 'services/paymentService';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PaymentTypes, Plans } from 'constants/plan';

import { IPayment, ISubscription } from 'interfaces/payment/payment.interface';

type Props = {
  payment: IPayment;
  clientId: string;
  type: string;
  orgRole: string;
};

type Payload = {
  subscription: ISubscription;
  upcomingInvoice: ISubscription;
  loading: boolean;
  error: Error;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error>>;
};

function useBillingDetail({ payment, clientId, type, orgRole }: Props): Payload {
  const [subscription, setSubscription] = useState<ISubscription>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<ISubscription>(null);
  const [loading, setLoading] = useState(payment.type !== Plans.FREE);
  const [error, setError] = useState<Error>(null);
  const dispatch = useDispatch();

  const resetState = (): void => {
    batch(() => {
      setLoading(true);
      setError(null);
      setSubscription(null);
      setUpcomingInvoice(null);
    });
  };

  useEffect(() => {
    const getBill = async (): Promise<void> => {
      try {
        resetState();
        const data = await paymentService.retrieveBillingInfo(clientId, type);
        if (!data) {
          return;
        }
        batch(() => {
          setSubscription(data.subscription);
          setUpcomingInvoice(data.upcomingInvoice);
          setLoading(false);
          if (data.upcomingInvoice.payment && type === PaymentTypes.ORGANIZATION) {
            dispatch(actions.updateOrganizationInList(clientId, { payment: data.upcomingInvoice.payment }));
          }
        });
      } catch (e) {
        batch(() => {
          setError(e);
          setLoading(false);
        });
      }
    };
    if (!(type === PaymentTypes.ORGANIZATION && orgRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER)) {
      void getBill();
    }
  }, [clientId, type, payment.status, orgRole]);

  return {
    subscription,
    upcomingInvoice,
    loading,
    error,
    setLoading,
    setError,
  };
}

export default useBillingDetail;
