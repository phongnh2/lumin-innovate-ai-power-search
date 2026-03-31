import {
  RabbitSubscribe,
  defaultNackErrorHandler,
} from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';

import { LoggerService } from 'Logger/Logger.service';
import { QUEUES } from 'RabbitMQ/RabbitMQ.constant';
import { AMQPMessage } from 'RabbitMQ/RabbitMQ.interface';

import { IFormFieldDetectionFailMessage, IFormFieldDetectionMessage } from './documentFormFieldDetection.interface';
import { DocumentFormFieldDetectionService } from './documentFormFieldDetection.service';

@Controller('form-field-detection')
export class DocumentFormFieldDetectionController {
  constructor(
    private readonly documentFormFieldDetectionService: DocumentFormFieldDetectionService,
    private readonly loggerService: LoggerService,
  ) {}

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_SFD_RESULT_QUEUE,
    errorHandler: defaultNackErrorHandler,
  })
  public onFormFieldDetectionCompleted(message: IFormFieldDetectionMessage, amqpMsg: AMQPMessage) {
    const {
      document_id: documentId,
      predictions,
      status,
      session_id: sessionId,
    } = message;
    const messageSize = amqpMsg.content.length;
    try {
      this.loggerService.info({
        context: this.onFormFieldDetectionCompleted.name,
        message: `Received message from Detection queue for document id: ${documentId} in session ${sessionId}`,
        extraInfo: {
          documentId,
          numberOfPredictions: predictions.length,
          status,
          sessionId,
          messageSize,
        },
      });
      this.documentFormFieldDetectionService.onFormFieldDetectionCompleted(
        message,
        messageSize,
      );
    } catch (error) {
      this.loggerService.error({
        context: this.onFormFieldDetectionCompleted.name,
        error: error.message,
        extraInfo: {
          documentId,
        },
      });
      this.documentFormFieldDetectionService.onFormFieldDetectionFailed({
        documentId,
        error: error as Error,
        sessionId,
      });
    }
  }

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_SFD_FAIL_INPUT_QUEUE,
    errorHandler: defaultNackErrorHandler,
  })
  handleFormFieldDetectionLambdaError(message: IFormFieldDetectionFailMessage) {
    const { documentId, errorMessage, sessionId } = message;
    if (!errorMessage) {
      return;
    }

    this.loggerService.error({
      context: this.handleFormFieldDetectionLambdaError.name,
      error: errorMessage,
      extraInfo: {
        documentId,
      },
    });
    this.documentFormFieldDetectionService.onFormFieldDetectionFailed({
      documentId,
      error: new Error(errorMessage),
      sessionId,
    });
  }
}
