import { DynamicModule, Module, Provider } from '@nestjs/common';
import Stripe from 'stripe';

import { STRIPE_CLIENT } from './constants';
import { StripeConfig } from './stripe.config';

@Module({})
export class StripeModule {
  static forRootAync(): DynamicModule {
    const stripeProvider: Provider = {
      provide: STRIPE_CLIENT,
      useFactory: (stripeConfig: StripeConfig): Stripe => new Stripe(stripeConfig.secretKey, stripeConfig.stripeConfig),
      inject: [StripeConfig],
    };
    return {
      module: StripeModule,
      providers: [stripeProvider, StripeConfig],
      exports: [stripeProvider, StripeConfig],
      global: true,
    };
  }
}
