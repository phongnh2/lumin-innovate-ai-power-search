import { ApiProperty } from '@nestjs/swagger';

import {
  OldPlans, PaymentPeriod, Currency, PriceVersion,
} from 'graphql.schema';

export class CreateOldPlanSubscriptionDto {
  @ApiProperty({ description: 'Customer email address' })
    email: string;

  @ApiProperty({ description: 'Subscription plan identifier', enum: OldPlans })
    plan: OldPlans;

  @ApiProperty({ description: 'Billing period', enum: PaymentPeriod })
    period: PaymentPeriod;

  @ApiProperty({ description: 'Currency code', enum: Currency })
    currency: Currency;

  @ApiProperty({ description: 'Quantity of subscriptions' })
    quantity: number;

  @ApiProperty({ description: 'Organization ID', required: false })
    orgId?: string;

  @ApiProperty({ description: 'Price version', enum: PriceVersion })
    priceVersion?: PriceVersion;
}
