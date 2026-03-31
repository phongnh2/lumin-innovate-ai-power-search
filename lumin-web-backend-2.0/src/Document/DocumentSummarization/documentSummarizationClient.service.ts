import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { LoggerService } from 'Logger/Logger.service';

import {
  DocSumService,
  GetSummaryResponse,
  InitDocSummarizationRequest,
  UpdateVotingRequest,
  UpdateVotingResponse,
} from './documentSummarization.interface';

@Injectable()
export class DocumentSummarizationClientService implements OnModuleInit {
  constructor(
    @Inject('AI_CLIENT')
    private readonly AIClient: ClientGrpc,
    private readonly loggerService: LoggerService,
  ) {}

  private documentSummarizationService: DocSumService;

  onModuleInit() {
    this.documentSummarizationService = this.AIClient.getService<DocSumService>('DocSumService');
  }

  initSummarization(input: InitDocSummarizationRequest): Promise<GetSummaryResponse> {
    this.loggerService.info({
      context: this.initSummarization.name,
      extraInfo: { documentId: input.doc_id },
    });
    return firstValueFrom(this.documentSummarizationService.GetSummary(input));
  }

  async updateSummaryVoting(input: UpdateVotingRequest): Promise<UpdateVotingResponse> {
    return firstValueFrom(this.documentSummarizationService.UpdateVoting(input));
  }
}
