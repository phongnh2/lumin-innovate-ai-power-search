import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type TimeSensitiveCouponVariationViewEventAttributes = {
  experimentId: string;
  variationId: number;
  organizationId: string;
  LuminUserId: string;
  anonymousUserId?: string;
  userAgent?: string;
};

export type TimeSensitiveCouponVariationViewInputAttributes = {
  variationId: number;
  organizationId: string;
  LuminUserId: string;
  anonymousUserId?: string;
  userAgent?: string;
};

export const VARIATION_VIEW_EVENT_TYPE = 'variationView';

const EXPERIMENT_ID = 'timeSensitiveCouponCode';

export class TimeSensitiveCouponVariationViewEvent extends PinpointEvent<TimeSensitiveCouponVariationViewEventAttributes> {
  constructor(attributes: TimeSensitiveCouponVariationViewInputAttributes) {
    const fullAttributes: TimeSensitiveCouponVariationViewEventAttributes = {
      experimentId: EXPERIMENT_ID,
      organizationId: attributes.organizationId,
      LuminUserId: attributes.LuminUserId,
      variationId: attributes.variationId,
      anonymousUserId: attributes.anonymousUserId,
      userAgent: attributes.userAgent,
    };
    super(fullAttributes);
  }

  protected construct(attributes: TimeSensitiveCouponVariationViewEventAttributes): TConstructEvent {
    return {
      EventType: VARIATION_VIEW_EVENT_TYPE,
      Attributes: this.standardize(attributes),
    };
  }
}
