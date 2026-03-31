import { get } from 'lodash';
import Stripe from 'stripe';

export type InvoiceLineData = Stripe.InvoiceLineItem;
export type InvoiceData = Stripe.Invoice;
export interface InvoiceSummary {
  currency: string;
  amountDue: number;
  subtotal: number;
  total: number;
  startingBalance: number;
  endingBalance: number;
  discount: number;
  nextBillingTimestamp?: number;
  lines: InvoiceLineData[];
}
export interface CouponInfo {
  duration: string;
  valid: boolean;
  durationInMonths?: number;
  percentOff?: number;
  amountOff?: number;
}

export interface BillingCycleInfo {
  nextBillingTimestamp: number;
  interval: string;
  amount: number;
}

export class InvoiceUtils {
  static getInvoiceLines(invoice: InvoiceData): InvoiceLineData[] {
    return get(invoice, 'lines.data', []);
  }

  static getDiscountAmount(invoice: InvoiceData): number {
    return get(invoice, 'total_discount_amounts[0].amount', 0);
  }

  static getCouponInfo(invoice: InvoiceData): CouponInfo {
    const coupon = get(invoice, 'discounts[0].coupon');
    return {
      duration: get(coupon, 'duration', ''),
      valid: get(coupon, 'valid', false),
      durationInMonths: get(coupon, 'duration_in_months'),
      percentOff: get(coupon, 'percent_off', 0),
      amountOff: get(coupon, 'amount_off', 0),
    };
  }

  static findLineByPriceId(invoice: InvoiceData, priceId: string): InvoiceLineData | null {
    const lines = this.getInvoiceLines(invoice);
    return lines.find((line) => get(line, 'price.id') === priceId) || null;
  }

  static calculateTotalBeforeDiscount(invoice: InvoiceData): number {
    const lines = this.getInvoiceLines(invoice);
    return lines.reduce((sum, line) => sum + get(line, 'price.unit_amount', 0) * get(line, 'quantity', 0), 0);
  }

  static getCustomerFacingDiscountCode(invoice: InvoiceData): string {
    const promotionCode = get(invoice, 'discounts[0].promotion_code.code');
    const couponCode = get(invoice, 'discounts[0].coupon.id');
    return promotionCode || couponCode;
  }
}
