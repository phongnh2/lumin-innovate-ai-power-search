import { defaultNackErrorHandler, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';

import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { AwsDocumentVersioningService } from 'Aws/aws.document-versioning.service';

import { DocumentVersioningService } from 'DocumentVersioning/documentVersioning.service';
import { LoggerService } from 'Logger/Logger.service';
import { QUEUES } from 'RabbitMQ/RabbitMQ.constant';

@Controller('document-versioning')
export class DocumentVersioningController {
  constructor(
    private readonly documentVersioningService: DocumentVersioningService,
    private readonly awsDocumentVersioningService: AwsDocumentVersioningService,
    private readonly loggerService: LoggerService,
  ) {}

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_DOCUMENT_VERSION_CREATE,
    errorHandler: defaultNackErrorHandler,
  })
  async createDocumentVersion(message: { objectKey: string }) {
    const { objectKey } = message;
    try {
      this.loggerService.info({
        context: this.createDocumentVersion.name,
        message: `Received message from queue for creating document version`,
        extraInfo: {
          objectKey,
        },
      });
      const headObject = await this.awsDocumentVersioningService.getHeadObject(
        objectKey,
      );
      if (!headObject?.Metadata) {
        throw HttpErrorException.NotFound(`Missing metadata: ${objectKey}`);
      }
      const {
        document_id: documentId,
        user_id: userId,
        version_id: versionId,
      } = <{
          document_id: string;
          version_id: string;
          user_id: string;
        }>headObject.Metadata;
      await this.documentVersioningService.createVersionFromAnnotChange({
        documentId: new Types.ObjectId(documentId),
        userId: new Types.ObjectId(userId),
        annotationPath: objectKey,
        versionId,
      });
    } catch (error) {
      this.loggerService.error({
        context: this.createDocumentVersion.name,
        message: 'Error creating document version',
        error,
        extraInfo: {
          objectKey,
        },
      });
    }
  }
}
