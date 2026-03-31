import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';

import { AwsCompressPdfService } from 'Aws/aws.compress-pdf.service';

import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { CompressOptionsInput } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

import { ICompressDocumentMessage } from './compressDocument.interfaces';

@Injectable()
export class CompressDocumentService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly awsCompressPdfService: AwsCompressPdfService,
    private readonly loggerService: LoggerService,
    private readonly messageGateway: EventsGateway,
  ) {}

  async createCompressDocumentPresignedUrl({
    documentId,
    compressOptions,
    sessionId,
  }: {
    documentId: string;
    compressOptions: CompressOptionsInput;
    sessionId: string;
  }) {
    const prefixEnv = this.environmentService.getByKey(EnvConstants.ENV);
    return this.awsCompressPdfService.getCompressDocumentPresignedUrl({
      documentId,
      prefixEnv,
      sessionId,
      compressOptions,
    });
  }

  onCompressDocumentCompleted(message: ICompressDocumentMessage) {
    const {
      documentId, presignedUrl, sessionId, error,
    } = message;
    if (!presignedUrl) {
      this.messageGateway.server
        .to(sessionId)
        .emit(SOCKET_MESSAGE.COMPRESS_PDF_COMPLETED, {
          documentId,
          error,
        });
      this.loggerService.error({
        context: this.onCompressDocumentCompleted.name,
        error: `Can not get compressed PDF presigned URL for document id: ${documentId}`,
        extraInfo: {
          documentId,
          sessionId,
        },
      });
      return;
    }

    this.messageGateway.server
      .to(sessionId)
      .emit(SOCKET_MESSAGE.COMPRESS_PDF_COMPLETED, {
        documentId,
        presignedUrl,
      });

    this.loggerService.info({
      context: this.onCompressDocumentCompleted.name,
      message: `Received presigned URL from compressed PDF queue for document id: ${documentId}`,
      extraInfo: {
        documentId,
        sessionId,
      },
    });
  }
}
