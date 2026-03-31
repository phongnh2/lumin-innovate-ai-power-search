import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { GrpcStatus } from 'Common/constants/GrpcConstants';

import { LoggerService } from 'Logger/Logger.service';

import { CompleteSummarizationRequest, Status } from './documentSummarization.interface';
import { DocumentSummarizationService } from './documentSummarization.service';

@Controller('document-summarization')
export class DocumentSummarizationController {
  constructor(
    private readonly documentSummarizationService: DocumentSummarizationService,
    private readonly loggerService: LoggerService,
  ) {}

  // TODO add validator
  @GrpcMethod('DocSumService', 'CompleteSummarization')
  async onDocumentSummarizationCompleted(req: CompleteSummarizationRequest): Promise<Status> {
    this.loggerService.info({
      context: this.onDocumentSummarizationCompleted.name,
      extraInfo: { documentId: req.doc_id, summaryId: req.summary_id, status: req.status },
    });
    await this.documentSummarizationService.onDocumentSummarizationCompleted(req);
    return { code: GrpcStatus.OK, message: 'Success' };
  }
}
