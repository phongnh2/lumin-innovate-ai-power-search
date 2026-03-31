import * as amqplib from 'amqplib';

import {
  QUEUES,
  ROUTING_KEY,
  EXCHANGE_KEYS,
  EXCHANGE_TYPE,
} from '../src/RabbitMQ/RabbitMQ.constant';

(async () => {
  // This url to use in local
  // This process.env will not working, but I note it here for someone want to run this script in local. Please replace it with your rabbitmq url
  const conn = await amqplib.connect(process.env.LUMIN_RABBITMQ_URL);
  // const conn = await amqplib.connect('amqp://guest:guest@localhost:5672');

  const channel = await conn.createChannel();
  // await channel.assertExchange(EXCHANGE_KEYS.NOTIFICATION, 'direct', {
  //   durable: true,
  //   autoDelete: false,
  // });
  // await channel.assertQueue(QUEUES.LUMIN_WEB_NOTIFICATION, {
  //   messageTtl: 604800000, //7days
  // });
  // await channel.bindQueue(
  //   QUEUES.LUMIN_WEB_NOTIFICATION,
  //   EXCHANGE_KEYS.NOTIFICATION,
  //   ROUTING_KEY.LUMIN_WEB,
  // );
  await channel.assertQueue(QUEUES.LUMIN_SFD_RESULT_QUEUE);
  await channel.assertQueue(QUEUES.LUMIN_SFD_FAIL_INPUT_QUEUE);
  await channel.assertExchange(EXCHANGE_KEYS.LUMIN_FFD_APPLY_AI_FIELDS, 'direct', {
    durable: true,
    autoDelete: false,
  });
  await channel.assertQueue(QUEUES.LUMIN_FFD_APPLY_AI_FIELDS);
  await channel.bindQueue(
    QUEUES.LUMIN_FFD_APPLY_AI_FIELDS,
    EXCHANGE_KEYS.LUMIN_FFD_APPLY_AI_FIELDS,
    ROUTING_KEY.LUMIN_FFD_APPLY_AI_FIELDS,
  );
  await channel.assertExchange(EXCHANGE_KEYS.USER_REGISTRATION, 'direct', {
    durable: true,
    autoDelete: false,
  });
  await channel.assertQueue(QUEUES.LUMIN_USER_REGISTRATION_QUEUE);
  await channel.bindQueue(
    QUEUES.LUMIN_USER_REGISTRATION_QUEUE,
    EXCHANGE_KEYS.USER_REGISTRATION,
    ROUTING_KEY.USER_REGISTRATION_SUCCESS,
  );

  // const assertedExchange = await channel.assertExchange(EXCHANGE_KEYS.DOCUMENT_VERSIONS, EXCHANGE_TYPE.DIRECT, {
  //   durable: true,
  // });
  // const assertedQueue = await channel.assertQueue(QUEUES.LUMIN_DOCUMENT_VERSION_CREATE);
  // await channel.bindQueue(
  //   assertedQueue.queue,
  //   assertedExchange.exchange,
  //   ROUTING_KEY.DOCUMENT_VERSION_CREATE,
  // );
  // await channel.assertExchange(EXCHANGE_KEYS.LUMIN_AI_SIMPLE_PDF, 'direct', {
  //   durable: true,
  //   autoDelete: false,
  // });
  // await channel.assertQueue(ROUTING_KEY.LUMIN_AI_SIMPLE_PDF_DETECTION_DEFAULT, {
  //   durable: true,
  //   autoDelete: false,
  // });
  // await channel.bindQueue(
  //   QUEUES.LUMIN_AI_SIMPLE_PDF_DETECTION,
  //   EXCHANGE_KEYS.LUMIN_AI_SIMPLE_PDF,
  //   ROUTING_KEY.LUMIN_AI_SIMPLE_PDF_DETECTION_DEFAULT,
  // );

  // sync OIDC avatar
  // await channel.assertExchange(EXCHANGE_KEYS.LUMIN_WEB_USER, EXCHANGE_TYPE.DIRECT, {
  //   durable: true,
  //   autoDelete: false,
  // });
  // await channel.assertQueue(QUEUES.LUMIN_WEB_SYNC_OIDC_AVATAR, {
  //   messageTtl: 3600000, // 1 hour
  // });
  // await channel.bindQueue(
  //   QUEUES.LUMIN_WEB_SYNC_OIDC_AVATAR,
  //   EXCHANGE_KEYS.LUMIN_WEB_USER,
  //   ROUTING_KEY.LUMIN_WEB_SYNC_OIDC_AVATAR_DEFAULT,
  // );

  // Share in slack feature
  await channel.assertExchange(EXCHANGE_KEYS.LUMIN_WEB_DOCUMENT_SHARING, EXCHANGE_TYPE.DIRECT, {
    durable: true,
    autoDelete: false,
  });
  await channel.assertQueue(QUEUES.LUMIN_WEB_DOCUMENT_SHARE_IN_SLACK);
  await channel.bindQueue(
    QUEUES.LUMIN_WEB_DOCUMENT_SHARE_IN_SLACK,
    EXCHANGE_KEYS.LUMIN_WEB_DOCUMENT_SHARING,
    ROUTING_KEY.LUMIN_WEB_DOCUMENT_SHARE_IN_SLACK_DEFAULT,
  );

  await channel.assertQueue(QUEUES.LUMIN_SFD_RESULT_QUEUE);
  await channel.assertQueue(QUEUES.LUMIN_SFD_FAIL_INPUT_QUEUE);
  await channel.assertExchange(EXCHANGE_KEYS.FORM_FIELD_DETECTION, 'direct', {
    durable: true,
    autoDelete: false,
  });
  await channel.assertQueue(QUEUES.LUMIN_FFD_APPLY_AI_FIELDS);
  await channel.bindQueue(
    QUEUES.LUMIN_FFD_APPLY_AI_FIELDS,
    EXCHANGE_KEYS.FORM_FIELD_DETECTION,
    ROUTING_KEY.LUMIN_FFD_APPLY_AI_FIELDS,
  );
  await channel.assertExchange(EXCHANGE_KEYS.USER_REGISTRATION, 'direct', {
    durable: true,
    autoDelete: false,
  });

  const compressPdfExchange = await channel.assertExchange(EXCHANGE_KEYS.LUMIN_COMPRESS_PDF, EXCHANGE_TYPE.DIRECT, {
    durable: true,
  });
  const compressPdfQueue = await channel.assertQueue(QUEUES.LUMIN_COMPRESS_PDF);
  await channel.bindQueue(
    compressPdfQueue.queue,
    compressPdfExchange.exchange,
    ROUTING_KEY.LUMIN_COMPRESS_PDF,
  );
  
  // await Promise.all(
  //   RETRY_TIMES.map(async (delay) => {
  //     if (delay === 0) return;
  //     const queueName = `${QUEUES.DELAY_WEBHOOK}-${delay / 1000 / 60}`;
  //     await channel.assertQueue(queueName, {
  //       messageTtl: delay,
  //       deadLetterExchange: EXCHANGES.DEFAULT,
  //     });
  //     await channel.bindQueue(queueName, EXCHANGES.DELAY_WEBHOOK, '', {
  //       delay,
  //       'x-match': 'all',
  //     });
  //   }),
  // );
  console.log('Setup RabbitMQ successfully');
  await channel.close();
  process.exit(0);
})();
