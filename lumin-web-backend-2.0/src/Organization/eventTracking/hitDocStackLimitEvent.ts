import { PaymentPlanEnums } from 'Payment/payment.enum';
import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type HitDocStackLimitEventAttributes = {
  workspaceID: string;
  paymentType: string;
  LuminUserId: string;
  anonymousUserId?: string;
  userAgent?: string;
};

export type HitDocStackLimitEventMetrics = {
  docStackLimit: number;
};

const HIT_DOC_STACK_LIMIT_EVENT_TYPE = 'hitDocStackLimit';

const PAYMENT_TYPE_MAPPING = {
  [PaymentPlanEnums.FREE]: 'free',
  [PaymentPlanEnums.ORG_STARTER]: 'starter',
  [PaymentPlanEnums.ORG_PRO]: 'pro',
  [PaymentPlanEnums.ORG_BUSINESS]: 'business',
};

export class HitDocStackLimitEvent extends PinpointEvent<HitDocStackLimitEventAttributes> {
  constructor(attributes: HitDocStackLimitEventAttributes, metrics: HitDocStackLimitEventMetrics) {
    const finalizedAttributes = {
      ...attributes,
      paymentType: PAYMENT_TYPE_MAPPING[attributes.paymentType],
    };
    super(finalizedAttributes, HIT_DOC_STACK_LIMIT_EVENT_TYPE, metrics);
  }

  protected construct(
    attributes: HitDocStackLimitEventAttributes,
    eventType: string,
    metrics: HitDocStackLimitEventMetrics,
  ): TConstructEvent {
    return {
      EventType: eventType || HIT_DOC_STACK_LIMIT_EVENT_TYPE,
      Attributes: this.standardize(attributes),
      Metrics: metrics,
    };
  }
}
