import { Injectable } from '@nestjs/common';

import { AwsService } from 'Aws/aws.service';

import { LoggerService } from 'Logger/Logger.service';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';

@Injectable()
export class DocumentCheckerService {
  constructor(
    private readonly awsService: AwsService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly loggerService: LoggerService,
  ) {}

  async checkSimplePdf(remoteId: string) {
    const presignedUrl = await this.awsService.getSignedUrlTemporaryFile(remoteId);
    const startToDetectSimplePdf = performance.now();
    const response = await this.rabbitMQService.request<
      | {
          is_simple_pdf: boolean;
          status: 'success';
        }
      | {
          status: 'error';
          message: string;
        }
    >({
      exchange: EXCHANGE_KEYS.LUMIN_AI_SIMPLE_PDF,
      routingKey: ROUTING_KEY.LUMIN_AI_SIMPLE_PDF_DETECTION_DEFAULT,
      payload: { presigned_url: presignedUrl, document_id: remoteId },
      timeout: 120000,
    });
    const endToDetectSimplePdf = performance.now();
    this.loggerService.info({
      context: 'CHECK_SIMPLE_PDF',
      message: `Time taken - check simple pdf: ${endToDetectSimplePdf - startToDetectSimplePdf} milliseconds`,
      extraInfo: {
        timeTaken: endToDetectSimplePdf - startToDetectSimplePdf,
        remoteId,
      },
    });

    if (response.status === 'error') {
      this.loggerService.error({
        context: 'CHECK_SIMPLE_PDF',
        message: response.message,
        extraInfo: {
          remoteId,
        },
      });

      return {
        isSimplePdf: false,
      };
    }

    return {
      isSimplePdf: response.is_simple_pdf,
    };
  }
}
