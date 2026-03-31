import { AmqpConnection, RequestOptions } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async publishBatch<T>(exchange: string, routingKey: string, messages: T[]): Promise<PromiseSettledResult<boolean>[]> {
    return Promise.allSettled(messages.map((message) => this.publish(exchange, routingKey, message)));
  }

  publish(exchange: string, routingKey: string, data: any) {
    return this.amqpConnection.publish(exchange, routingKey, data);
  }

  request<T>(requestOptions: RequestOptions): Promise<T> {
    return this.amqpConnection.request<T>(requestOptions);
  }

  async publishWithPriority<T>(params: {exchange: string, routingKey: string, data: T, priority: number}): Promise<boolean> {
    const {
      exchange, routingKey, data, priority,
    } = params;
    return this.amqpConnection.publish(exchange, routingKey, data, { priority });
  }

  async publishWithExpiration<T>(params: {
    exchange: string,
    routingKey: string,
    data: T,
    expirationMs: number
  }): Promise<boolean> {
    const {
      exchange, routingKey, data, expirationMs,
    } = params;
    return this.amqpConnection.publish(exchange, routingKey, data, {
      expiration: expirationMs.toString(),
    });
  }
}
