import { NestFactory } from '@nestjs/core';
// import * as compression from 'compression';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// eslint-disable-next-line import/extensions
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { AnonymousUserInterceptor } from 'Common/interceptors/anonymous-user.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { ServerTimingInterceptor } from 'Common/interceptors/server-timing.interceptor';

import { AppModule } from 'app.module';
import { EnvironmentService } from 'Environment/environment.service';
import { RedisIoAdapter } from 'Gateway/RedisIoAdapter';
import { grpcClientOptions } from 'Microservices/grpc/grpc.options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environmentService = app.get(EnvironmentService);
  app.enableShutdownHooks();
  app.use(CommonConstants.APOLLO_SERVER_PATH, graphqlUploadExpress({ maxFileSize: 200 * 1024 * 1024, maxFiles: 100 }));

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.useGlobalInterceptors(new ServerTimingInterceptor(), new SanitizeInputInterceptor(), new AnonymousUserInterceptor(environmentService));
  app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);
  if (process.env.LUMIN_ENV === 'development') {
    app.enableCors({
      origin: environmentService.luminOrigins,
      credentials: true,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  // app.use(compression());
  app.use(cookieParser());
  app.use('/payment', bodyParser.raw({ type: '*/*' }));

  if (process.env.LUMIN_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Lumin API')
      .setDescription('The Lumin API description')
      .setVersion('1.0')
      .addTag('lumin')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, documentFactory);
  }

  await app.startAllMicroservices();
  await app.listen(4200);
}
bootstrap();
