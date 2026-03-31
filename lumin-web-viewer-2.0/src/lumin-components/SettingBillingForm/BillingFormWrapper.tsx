import React, { useEffect, useState } from 'react';

import Loading from 'lumin-components/Loading';

import { useEnableWebReskin } from 'hooks';

import { paymentServices } from 'services';

import logger from 'helpers/logger';

import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

import SettingBillingForm from './SettingBillingForm';
import { SelectedOrgBilling } from './SettingBillingForm.interface';

import * as Styled from './SettingBillingForm.styled';

type Props = {
  selectedBilling: SelectedOrgBilling;
};

function BillingFormWrapper(props: Props): JSX.Element {
  const { selectedBilling } = props;
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<IPaymentMethod>(null);
  const [customerInfo, setCustomerInfo] = useState<ICustomerInfo>(null);
  const [isFetchingCard, setFetchingCard] = useState(true);

  const { isEnableReskin } = useEnableWebReskin();

  useEffect(() => {
    const fetchCurrentCard = async (): Promise<void> => {
      if (!selectedBilling) {
        return;
      }
      try {
        setFetchingCard(true);
        const data = await paymentServices.getPaymentMethodAndCustomerInfo({
          clientId: selectedBilling._id,
          type: selectedBilling.type,
          fetchOptions: null,
        });
        setCurrentPaymentMethod(data[0]);
        setCustomerInfo(data[1]);
      } catch (e) {
        logger.logError({ error: e });
        setCurrentPaymentMethod(null);
      } finally {
        setFetchingCard(false);
      }
    };
    fetchCurrentCard().catch(() => {});
  }, [selectedBilling]);

  if (isFetchingCard) {
    return (
      <Styled.LoadingWrapper $isReskin={isEnableReskin}>
        <Loading useReskinCircularProgress={isEnableReskin} normal />
      </Styled.LoadingWrapper>
    );
  }

  return (
    <SettingBillingForm
      currentPaymentMethod={currentPaymentMethod}
      setCurrentPaymentMethod={setCurrentPaymentMethod}
      customerInfo={customerInfo}
      setCustomerInfo={setCustomerInfo}
      {...props}
    />
  );
}

export default BillingFormWrapper;
