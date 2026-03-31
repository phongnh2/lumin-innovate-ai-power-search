import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeConfig } from './stripe.config';

@Injectable()
export class StripeClient {
  public readonly client: Stripe;

  constructor(private readonly stripeConfig: StripeConfig) {
    this.client = new Stripe(stripeConfig.secretKey, stripeConfig.stripeConfig);
  }
}
