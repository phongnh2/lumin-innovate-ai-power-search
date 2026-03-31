import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const AcceptanceRateLimiter = (...strategies: string[]): CustomDecorator<string> => SetMetadata('strategies', strategies);
