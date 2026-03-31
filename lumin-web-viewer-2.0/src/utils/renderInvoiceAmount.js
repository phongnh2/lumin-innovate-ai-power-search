import paymentUtil from 'utils/paymentUtil';

import numberUtils from './numberUtils';

export default function renderInvoiceAmount(invoiceTotal, currency) {
  const amount = invoiceTotal / 100;

  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);

  return `${currencySymbol}${amount < 0 ? 0 : numberUtils.formatDecimal(Math.abs(amount))}`;
}
