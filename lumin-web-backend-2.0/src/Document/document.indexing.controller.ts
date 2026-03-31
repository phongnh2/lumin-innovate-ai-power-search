import { defaultNackErrorHandler, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';

import { DocumentIndexingBacklogService } from 'DocumentIndexingBacklog/documentIndexingBacklog.service';
import { LoggerService } from 'Logger/Logger.service';
import { QUEUES } from 'RabbitMQ/RabbitMQ.constant';

import { DocumentIndexingStatusEnum } from './document.enum';
import { DocumentService } from './document.service';

@Controller('document-indexing')
export class DocumentIndexingController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly documentService: DocumentService,
    private readonly documentIndexingBacklogService: DocumentIndexingBacklogService,
  ) {}

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_RAG_DOCUMENT_INDEXING_STATUS_SYNC,
    createQueueIfNotExists: false,
    errorHandler: defaultNackErrorHandler,
  })
  async syncIndexingStatus(message: { documentId: string, status: DocumentIndexingStatusEnum }) {
    this.loggerService.info({
      context: this.syncIndexingStatus.name,
      extraInfo: {
        message,
      },
    });
    const { documentId, status } = message;
    if (!Object.values(DocumentIndexingStatusEnum).includes(status)) {
      this.loggerService.error({
        context: this.syncIndexingStatus.name,
        extraInfo: {
          message,
        },
      });
      return;
    }
    await Promise.all([
      this.documentService.updateDocumentChunkedStatus(documentId, status),
      this.documentIndexingBacklogService.deleteDocumentIndexingBacklog(documentId),
    ]);
  }
}
