import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

@Injectable()
export class StripeConfig {
  public readonly secretKey: string;

  public readonly nzPublicKey: string;

  public readonly usPublicKey: string;

  public readonly stripeConfig: Stripe.StripeConfig;

  public readonly webhookSecret: string;

  public readonly luminEnv: string;

  public constructor(
    private readonly environmentService: EnvironmentService,
  ) {
    this.luminEnv = this.environmentService.getByKey(EnvConstants.ENV);
    this.secretKey = this.environmentService.getByKey(EnvConstants.STRIPE_PLATFORM_SECRET_KEY);
    this.webhookSecret = this.environmentService.getByKey(EnvConstants.STRIPE_PLATFORM_WEBHOOK_SECRET);
    this.stripeConfig = {
      apiVersion: '2024-04-10',
      maxNetworkRetries: 2,
      telemetry: false,
      appInfo: {
        name: `lumin-web-backend/${this.luminEnv}`,
      },
    };
  }
}
