import React from 'react';

interface SettingBillingFormContextType {
  isChangingCard: boolean;
  setIsChangingCard: React.Dispatch<React.SetStateAction<boolean>>;
  savingBillingInfo: boolean;
  setSavingBillingInfo: React.Dispatch<React.SetStateAction<boolean>>;
  paymentMethodError: string;
  setPaymentMethodError: React.Dispatch<React.SetStateAction<string>>;
}

export const SettingBillingFormContext = React.createContext<SettingBillingFormContextType | null>(null);

export const useSettingBillingFormContext = () => React.useContext(SettingBillingFormContext);
