import { RabbitMQExchangeConfig, RabbitMQQueueConfig } from '@golevelup/nestjs-rabbitmq';

import {
  EXCHANGE_KEYS, QUEUES, ROUTING_KEY, EXCHANGE_TYPE,
} from './RabbitMQ.constant';

export const RABBITMQ_EXCHANGES: RabbitMQExchangeConfig[] = [
  {
    name: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    type: EXCHANGE_TYPE.DIRECT,
    createExchangeIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
    },
  },
  {
    name: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
    type: EXCHANGE_TYPE.DIRECT,
    createExchangeIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
    },
  },
  {
    name: EXCHANGE_KEYS.NOTIFICATION,
    type: EXCHANGE_TYPE.DIRECT,
    createExchangeIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
    },
  },
  {
    name: EXCHANGE_KEYS.LUMIN_WEB_USER,
    type: EXCHANGE_TYPE.DIRECT,
    createExchangeIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
    },
  },
];

export const RABBITMQ_QUEUES: RabbitMQQueueConfig[] = [
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DEFAULT,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
      },
    },
  },
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_DELETE,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DELETE,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
      },
    },
  },
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_UPDATE,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_UPDATE,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
      },
    },
  },
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_STATUS_SYNC,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_STATUS_SYNC,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
      },
    },
  },
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
    },
  },
  {
    name: QUEUES.LUMIN_WEB_SYNC_SIGN_NOTIFICATION,
    exchange: EXCHANGE_KEYS.NOTIFICATION,
    routingKey: ROUTING_KEY.LUMIN_WEB_SYNC_SIGN_NOTIFICATION_DEFAULT,
    createQueueIfNotExists: true,
    options: {
      messageTtl: 604800000, // 7days
    },
  },
  {
    name: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
    exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
    routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DLX,
        'x-max-priority': 10,
      },
    },
  },
  {
    name: QUEUES.LUMIN_WEB_SYNC_OIDC_AVATAR,
    exchange: EXCHANGE_KEYS.LUMIN_WEB_USER,
    routingKey: ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DEFAULT,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      messageTtl: 3600000, // 1 hour
    },
  },
  {
    name: QUEUES.LUMIN_WEB_SYNC_OIDC_AVATAR_DELAY,
    exchange: EXCHANGE_KEYS.LUMIN_WEB_USER,
    routingKey: ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DELAY,
    createQueueIfNotExists: true,
    options: {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': EXCHANGE_KEYS.LUMIN_WEB_USER,
        'x-dead-letter-routing-key': ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DEFAULT,
      },
    },
  },
];
