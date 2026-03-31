export const PNBButtonName = {
  USE_ANOTHER_CARD: 'useAnotherCard',
  REDIRECT_TO_PAYMENT_PAGE_WITH_PREPAID_CARD: 'redirectToPaymentPageWithPrepaidCard',
  USE_CASH_APP_PAY: 'useCashAppPay',
  CANCEL_SUTTON_BANK_WARNING: 'cancelPrepaidWarning',
};

export const PNBButtonPurpose = {
  [PNBButtonName.USE_ANOTHER_CARD]: 'Use another card to charge the free trial',
  [PNBButtonName.REDIRECT_TO_PAYMENT_PAGE_WITH_PREPAID_CARD]:
    'Redirect to payment page after using prepaid card to charge the free trial',
  [PNBButtonName.USE_CASH_APP_PAY]: 'Switch to Cash App Pay after Sutton Bank card warning',
  [PNBButtonName.CANCEL_SUTTON_BANK_WARNING]: 'Cancel Sutton Bank prepaid card warning modal',
};
