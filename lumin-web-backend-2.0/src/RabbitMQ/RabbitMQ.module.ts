import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';

import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES } from './RabbitMQ.config';
import { RabbitMQService } from './RabbitMQ.service';

const configFactory = (environmentService: EnvironmentService): RabbitMQConfig => {
  const uri = environmentService.getByKey(EnvConstants.RABBITMQ_URL as string);
  if (!uri) {
    // Prevent connection error
    // https://github.com/golevelup/nestjs/blob/master/packages/rabbitmq/README.md#prevent-connection-error
    return undefined;
  }
  return {
    name: 'lumin-web-backend',
    uri,
    connectionInitOptions: { wait: false },
    enableControllerDiscovery: true,
    exchanges: RABBITMQ_EXCHANGES,
    queues: RABBITMQ_QUEUES,
    connectionManagerOptions: {
      connectionOptions: {
        clientProperties: {
          connection_name: 'lumin-web-backend',
        },
      },
    },
  };
};

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [EnvironmentModule],
      useFactory: configFactory,
      inject: [EnvironmentService],
    }),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMqModule {}
