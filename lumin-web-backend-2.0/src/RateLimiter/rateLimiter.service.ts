import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { OperationLimitConstants } from 'Common/constants/OperationLimitConstants';
import { RateLimiterType, RateLimiterFileSize, RateLimiterFileSizeForMobile } from 'Common/constants/RateLimiterConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class RateLimiterService {
  public rateLimiter;

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.rateLimiter = this.constructConstants();
  }

  async lookup(user: User, operationName: string) {
    if (!user) {
      return this.rateLimiter[RateLimiterType.FREE][operationName];
    }
    if (user?.payment?.type !== RateLimiterType.FREE) {
      return this.rateLimiter[RateLimiterType.PAID][operationName];
    }
    const isPremiumUser = await this.userService.isAvailableUsePremiumFeature(user);

    return isPremiumUser ? this.rateLimiter[RateLimiterType.PAID][operationName] : this.rateLimiter[RateLimiterType.FREE][operationName];
  }

  verifyUploadFilesSize(isPremiumUser: boolean, files, isMobile = false): boolean {
    if (isPremiumUser) {
      return files.every((file) => file.size <= (isMobile ? RateLimiterFileSizeForMobile.PAID : RateLimiterFileSize.PAID));
    }
    return files.every((file) => file.size <= (isMobile ? RateLimiterFileSizeForMobile.FREE : RateLimiterFileSize.FREE));
  }

  private constructConstants() {
    const operations = Object.keys(OperationLimitConstants).reduce((acc, current) => ({
      ...acc,
      [OperationLimitConstants[current]]: {
        total: this.environmentService.getByKey(`${current}_TOTAL`) || this.environmentService.getByKey(EnvConstants.RATE_LIMIT_DEFAULT_TOTAL),
        expire: this.environmentService.getByKey(`${current}_EXPIRE`) || this.environmentService.getByKey(EnvConstants.RATE_LIMIT_DEFAULT_EXPIRE),
      },
    }), {});
    const paidOperations = Object.keys(OperationLimitConstants).reduce((acc, current) => ({
      ...acc,
      [OperationLimitConstants[current]]: {
        total: this.environmentService.getByKey(`${current}_PAID_TOTAL`)
        || this.environmentService.getByKey(`${current}_TOTAL`)
        || this.environmentService.getByKey(EnvConstants.RATE_LIMIT_DEFAULT_PAID_TOTAL),
        expire: this.environmentService.getByKey(`${current}_PAID_EXPIRE`)
        || this.environmentService.getByKey(`${current}_EXPIRE`)
        || this.environmentService.getByKey(EnvConstants.RATE_LIMIT_DEFAULT_PAID_EXPIRE),
      },
    }), {});
    return {
      [RateLimiterType.FREE]: operations,
      [RateLimiterType.PAID]: paidOperations,
    };
  }
}
