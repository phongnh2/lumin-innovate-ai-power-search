import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { DocumentIndexingBacklogService } from './documentIndexingBacklog.service';

@Controller('document-indexing-backlog')
export class DocumentIndexingBacklogController {
  constructor(
    private readonly documentIndexingBacklogService: DocumentIndexingBacklogService,
  ) {}

  @GrpcMethod('WorkerService', 'IndexHistoricalDocuments')
  async indexHistoricalDocuments() {
    await this.documentIndexingBacklogService.indexHistoricalDocuments();
  }
}
