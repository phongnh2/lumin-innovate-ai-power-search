import { CountryCodeEnums } from 'Auth/countryCode.enum';
import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type CashAppVariationViewEventAttributes = {
  isEnableCashAppPay: boolean,
  experimentId: string,
  variationId: string,
  variationName: string,
  organizationId: string,
  LuminUserId: string,
  anonymousUserId?: string;
  userAgent?: string;
};

export type CashAppVariationViewInputAttributes = {
  isEnableCashAppPay: boolean,
  organizationId: string,
  LuminUserId: string,
  ipCountryCode: CountryCodeEnums
  anonymousUserId?: string;
  userAgent?: string;
}

export const VARIATION_VIEW_EVENT_TYPE = 'variationView';

enum VariationName {
  Control = 'Control',
  Variation1 = 'Variation 1',
}

const EXPERIMENT_ID = 'enable-cash-app-pay';

const VARIATION_ID = {
  [VariationName.Control]: '0',
  [VariationName.Variation1]: '1',
};

export class CashAppVariationView extends PinpointEvent<CashAppVariationViewEventAttributes> {
  constructor(attributes: CashAppVariationViewInputAttributes) {
    const variationName = attributes.isEnableCashAppPay ? VariationName.Variation1 : VariationName.Control;
    const fullAttributes: CashAppVariationViewEventAttributes = {
      ...attributes,
      experimentId: EXPERIMENT_ID,
      variationName,
      variationId: VARIATION_ID[variationName],
    };
    super(fullAttributes);
  }

  protected construct(attributes: CashAppVariationViewEventAttributes): TConstructEvent {
    return {
      EventType: VARIATION_VIEW_EVENT_TYPE,
      Attributes: this.standardize(attributes),
    };
  }
}
