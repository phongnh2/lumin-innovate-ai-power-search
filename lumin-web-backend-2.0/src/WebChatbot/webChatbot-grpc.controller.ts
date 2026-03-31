import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { DocumentIndexingStatusEnum } from 'Document/document.enum';
import { IDocument } from 'Document/interfaces';
import { LoggerService } from 'Logger/Logger.service';

import { GetDocumentsRequest, WebChatbotGrpcService } from './webChatbot-grpc.service';

@Controller('webchatbot')
export class WebChatbotGrpcController {
  constructor(
    private readonly webChatbotGrpcService: WebChatbotGrpcService,
    private readonly loggerService: LoggerService,
  ) {}

  @GrpcMethod('DocumentService', 'GetDocuments')
  async getDocuments(input: GetDocumentsRequest) {
    try {
      const result = await this.webChatbotGrpcService.getDocuments(input);

      const indexedDocuments = result.documents.filter((doc: IDocument) => doc.metadata?.indexingStatus === DocumentIndexingStatusEnum.COMPLETED);

      return {
        documents: indexedDocuments.map((doc) => ({
          _id: doc._id,
          name: doc.name,
          size: doc.size,
          service: doc.service,
          lastAccess: doc.lastAccess,
        })),
        hasMore: result.hasNextPage,
        total: indexedDocuments.length,
      };
    } catch (error) {
      this.loggerService.error({
        message: 'Error retrieving workspace documents (grpc)',
        error,
        extraInfo: input,
      });

      if (error instanceof GrpcErrorException) {
        throw error;
      }

      throw GrpcErrorException.Unknown('Internal server error', DefaultErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
