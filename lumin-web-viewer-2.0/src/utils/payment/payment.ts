/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { isEmpty, isNil, omitBy } from 'lodash';

import { getLanguageFromUrl } from 'utils/getLanguage';

import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { PLAN_URL } from 'constants/plan';
import { PaymentPeriod, PaymentStatus } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import {
  IOrganizationPayment,
  IPayment,
  ITrialInfo,
  PaymentSubScriptionItem,
} from 'interfaces/payment/payment.interface';

type GetNextPaymentUrlParams = {
  payment: Pick<IOrganizationPayment, 'type'>;
  orgId: string;
};

export class PaymentUrlSerializer {
  private _targetUrl: string;

  private _plan: string;

  private _isTrial = false;

  private _search: string;

  private readonly _defaultPeriod = PaymentPeriod.ANNUAL;

  private readonly _defaultPlan = UnifySubscriptionPlan.ORG_PRO;

  private _period: string = this._defaultPeriod;

  private _quantity: number;

  private _returnUrl: string;

  private _from: string;

  private _checkout: string;

  private _trial: boolean;

  private _product: UnifySubscriptionProduct = UnifySubscriptionProduct.PDF;

  of(target: string): this {
    this._targetUrl = target;
    return this;
  }

  product(product: UnifySubscriptionProduct) {
    this._product = product;
    return this;
  }

  period(period: string): this {
    this._period = period;
    return this;
  }

  plan(plan: string): this {
    this._plan = plan;
    return this;
  }

  trial(usingTrial: boolean): this {
    this._isTrial = usingTrial;
    return this;
  }

  searchParam(search: string): this {
    this._search = search;
    return this;
  }

  quantityParam(quantity: number): this {
    this._quantity = quantity;
    return this;
  }

  fromParam(from: string): this {
    this._from = from;
    return this;
  }

  trialParam(trial: boolean): this {
    this._trial = trial;
    return this;
  }

  checkout(checkout: string): this {
    this._checkout = checkout;
    return this;
  }

  returnUrlParam(url?: string): this {
    if (url) {
      this._returnUrl = url;
    } else {
      this._returnUrl = window.location.pathname + window.location.search;
      const languageFromUrl = getLanguageFromUrl();
      if (languageFromUrl) {
        this._returnUrl = this._returnUrl.substring(3);
      }
    }
    return this;
  }

  createSearchObject(search: string): Record<string, string> {
    const searchParam = new URLSearchParams(search);
    const searchObj = {} as Record<string, string>;
    Array.from(searchParam.entries()).forEach(([key, value]) => {
      searchObj[key] = value;
    });
    return searchObj;
  }

  validPlan(): boolean {
    return [
      UnifySubscriptionPlan.ORG_STARTER,
      UnifySubscriptionPlan.ORG_PRO,
      UnifySubscriptionPlan.ORG_BUSINESS,
    ].includes(this._plan.toUpperCase() as UnifySubscriptionPlan);
  }

  validPeriod(): boolean {
    return Object.values(PaymentPeriod).includes(this._period.toUpperCase() as PaymentPeriod);
  }

  validParams(): boolean {
    return this.validPeriod() && this.validPlan();
  }

  private paymentRoot(): string {
    const root = this._isTrial ? Routers.PAYMENT_FREE_TRIAL : Routers.PAYMENT;
    const planUrl: string = (PLAN_URL as Record<string, string>)[this._plan];
    const checkoutUrl = this._checkout || null;
    if (!this._isTrial && !checkoutUrl) {
      return root;
    }
    return [root, checkoutUrl, planUrl, this._period.toLowerCase()].filter(Boolean).join('/');
  }

  get defaultTrial(): string {
    return this.trial(true).period(this._defaultPeriod).plan(this._defaultPlan).get();
  }

  get default(): string {
    return this.trial(false).period(PaymentPeriod.ANNUAL).plan(this._defaultPlan).get();
  }

  get business(): string {
    return this.trial(false).period(this._defaultPeriod).plan(UnifySubscriptionPlan.ORG_BUSINESS).get();
  }

  get pro(): string {
    return this.trial(false).period(this._defaultPeriod).plan(UnifySubscriptionPlan.ORG_PRO).get();
  }

  get(): string {
    if (!this._plan) {
      throw new Error('Plan is required in url');
    }
    if (this._isTrial) {
      const obj = omitBy(
        {
          [UrlSearchParam.PAYMENT_ORG_TARGET]: this._targetUrl,
          [UrlSearchParam.PAYMENT_ORG_QUANTITY]: this._quantity,
          [UrlSearchParam.FROM_PAGE]: this._from,
          [UrlSearchParam.RETURN_URL]: this._returnUrl,
          ...this.createSearchObject(this._search),
          [UrlSearchParam.TRIAL]: this._trial,
        },
        isNil
      );
      const search = new URLSearchParams(obj);
      return [this.paymentRoot(), search.toString()].filter(Boolean).join('?');
    }
    const planSearchParamByProduct = {
      [UnifySubscriptionProduct.PDF]: UrlSearchParam.PDF_PLAN,
      [UnifySubscriptionProduct.SIGN]: UrlSearchParam.SIGN_PLAN,
    }[this._product];
    const obj = omitBy(
      {
        [planSearchParamByProduct]: PLAN_URL[this._plan as keyof typeof PLAN_URL],
        [UrlSearchParam.PAYMENT_PERIOD]: this._period.toLowerCase(),
        [UrlSearchParam.PAYMENT_ORG_TARGET]: this._targetUrl,
        [UrlSearchParam.FROM_PAGE]: this._from,
        [UrlSearchParam.RETURN_TO]: this._returnUrl,
        ...this.createSearchObject(this._search),
        [UrlSearchParam.TRIAL]: this._trial,
      },
      isNil
    );
    const search = new URLSearchParams(obj);
    return [this.paymentRoot(), search.toString()].filter(Boolean).join('?');
  }
}

export class PaymentHelpers {
  static evaluateTrialPlan(trialInfo: Partial<ITrialInfo>): string {
    if (isEmpty(trialInfo)) {
      return null;
    }
    if (!trialInfo.canStartTrial) {
      return null;
    }
    if (trialInfo.canUseProTrial) {
      return UnifySubscriptionPlan.ORG_PRO;
    }
    return UnifySubscriptionPlan.ORG_BUSINESS;
  }

  static isDocStackPlan(plan: string): boolean {
    return [
      UnifySubscriptionPlan.ORG_STARTER,
      UnifySubscriptionPlan.ORG_PRO,
      UnifySubscriptionPlan.ORG_BUSINESS,
    ].includes(plan as UnifySubscriptionPlan);
  }

  static isSignProduct(productName: string): boolean {
    return productName === UnifySubscriptionProduct.SIGN;
  }

  static isOrgTrialing(subscriptionItem: PaymentSubScriptionItem): boolean {
    return (
      PaymentHelpers.isDocStackPlan(subscriptionItem.paymentType) &&
      subscriptionItem.paymentStatus === PaymentStatus.TRIALING
    );
  }

  static getNextPaymentUrl = ({ payment, orgId }: GetNextPaymentUrlParams): string => {
    const nextPlan = PaymentHelpers.isDocStackPlan(payment.type) ? payment.type : UnifySubscriptionPlan.ORG_PRO;
    return new PaymentUrlSerializer().of(orgId).period(PaymentPeriod.ANNUAL).plan(nextPlan).returnUrlParam().get();
  };

  static isMatchingUnifyPaymentStatus({
    payment,
    product,
    status,
  }: {
    payment: IPayment;
    product?: PaymentSubScriptionItem;
    status: PaymentStatus;
  }): boolean {
    if (!product?.productName) {
      return payment.status === status;
    }
    if (product.productName === UnifySubscriptionProduct.PDF) {
      return payment.status === status || product.paymentStatus === status;
    }
    return product.paymentStatus === status;
  }
}
