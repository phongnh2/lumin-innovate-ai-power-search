import { defaultNackErrorHandler, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';

import { LoggerService } from 'Logger/Logger.service';
import { QUEUES } from 'RabbitMQ/RabbitMQ.constant';

import { ICompressDocumentMessage } from './compressDocument.interfaces';
import { CompressDocumentService } from './compressDocument.service';

@Controller('compress-document')
export class CompressDocumentController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly compressDocumentService: CompressDocumentService,
  ) {}

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_COMPRESS_PDF,
    errorHandler: defaultNackErrorHandler,
  })
  onCompressDocumentCompleted(message: ICompressDocumentMessage) {
    const {
      documentId, presignedUrl, sessionId, error: compressedError,
    } = message;
    try {
      this.loggerService.info({
        context: this.onCompressDocumentCompleted.name,
        message: `Received message from Compress PDF queue for document id: ${documentId}`,
        extraInfo: {
          sessionId,
          documentId,
          presignedUrl,
          error: compressedError,
        },
      });
      this.compressDocumentService.onCompressDocumentCompleted(message);
    } catch (error) {
      this.loggerService.error({
        context: this.onCompressDocumentCompleted.name,
        error: error.message,
        extraInfo: {
          sessionId,
          documentId,
        },
      });
    }
  }
}
