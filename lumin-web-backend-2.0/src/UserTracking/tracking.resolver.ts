import {
  Resolver,
} from '@nestjs/graphql';

import { UserTrackingService } from 'UserTracking/tracking.service';

@Resolver('UserTracking')
export class UserTrackingResolver {
  constructor(
    private readonly userTrackingService: UserTrackingService,
  ) {}
}
