import { Injectable } from '@nestjs/common';

import { INotificationIntegration } from 'Common/factory/IntegrationNotiFactory/notification.interface';

import { LoggerService } from 'Logger/Logger.service';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  sendNotificationToIntegration(data: INotificationIntegration) {
    try {
      this.rabbitMQService.publish(EXCHANGE_KEYS.NOTIFICATION, ROUTING_KEY.LUMIN_WEB, data);
    } catch (error) {
      this.loggerService.error({
        message: `Failed to send ${data.type} notification to integration`,
        error,
      });
    }
  }
}
