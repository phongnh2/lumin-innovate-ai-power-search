/* eslint-disable max-len */
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { BasicResponse, CreateDeviceTrackingInput } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

@Resolver('DeviceTracking')
export class DeviceTrackingResolver {
  constructor(private readonly loggerService: LoggerService) { }

  @Mutation('createDeviceTracking')
  createDeviceTracking(
    @Args('input') input: CreateDeviceTrackingInput,
  ): BasicResponse {
    const {
      deviceId, userId, platform, deviceModel, apiLevel, isRooted,
    } = input;
    this.loggerService.info({
      deviceId, userId, platform, deviceModel, apiLevel, isRooted,
    });
    return {
      message: 'Log successfully',
      statusCode: 200,
    };
  }
}
