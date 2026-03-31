import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { DocumentService } from 'Document/document.service';
import { DocumentOutlineService } from 'Document/documentOutline.service';
import { DocumentEventNames, EventScopes } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { LoggerService } from 'Logger/Logger.service';
import { UserService } from 'User/user.service';

import { MAX_ANNOTATION_SYNC_COUNT } from './constants/autoSync.constant';
import { ISocket } from './Socket.interface';
import { SocketRoomGetter } from './SocketRoom';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly documentOutlineService: DocumentOutlineService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly personalEventService: PersonalEventService,
    private readonly loggerService: LoggerService,
  ) {}

  async handleResponseAutoSyncSuccess(socket: ISocket, data: {
    status: string,
    remoteId: string,
    documentId: string,
    increaseVersion: boolean,
    dataSync: {
      annotations?: { _id: string }[],
      fields?: { _id: string }[],
      forceSync?: boolean,
      lastManipulationStepId?: string,
    },
  }) {
    const { remoteId, documentId } = data;
    const { annotations = [], fields = [], lastManipulationStepId } = data.dataSync;
    const annotationIds = annotations.map((annot) => annot._id);
    const onlineMembers = await socket.nsp
      .in(SocketRoomGetter.document(data.remoteId))
      .fetchSockets();
    const otherOnlineMembers = onlineMembers.filter(
      ({ id }) => id !== socket.id,
    );
    if (otherOnlineMembers.length) {
      if (
        annotationIds.length > MAX_ANNOTATION_SYNC_COUNT
        || fields.length > MAX_ANNOTATION_SYNC_COUNT
      ) {
        /**
         * When the user updates a large number of annotations, trigger a reload notification for all documents
         * that share the same Google Drive source to ensure data consistency across all instances.
         */
        socket
          .to(SocketRoomGetter.document(remoteId))
          .emit(`updatedTextContent-${remoteId}`, {
            status: 'success',
            documentId,
          });
      }
      if (annotationIds.length) {
        const annotationsResult = await this.documentService.getAnnotationsByAnnotationIds(
          annotationIds,
        );
        annotationsResult.forEach((annot) => {
          socket
            .to(SocketRoomGetter.document(remoteId))
            .emit('annotationChanged', {
              documentId: annot.documentId,
              xfdf: annot.xfdf,
              annotationId: annot.annotationId,
              lastModified: Date.now(),
              isInternal: true,
            });
        });
      }

      if (fields.length) {
        const fieldIds = fields.map((field) => field._id);
        const fieldsResult = await this.documentService.getFormFieldByIds(
          fieldIds,
          { _id: 0, __v: 0, documentId: 0 },
        );
        fieldsResult.forEach((field) => {
          socket
            .to(SocketRoomGetter.document(remoteId))
            .emit('formFieldChanged', {
              fieldName: field.name,
              updatedData: field,
            });
        });
      }
    }
    const deletePromise = [];
    let deleteAnnotsPromise = null;
    if (annotationIds.length > 0) {
      deleteAnnotsPromise = this.documentService.clearAnnotationOfDocument({
        _id: { $in: annotationIds },
      });
    } else if (data.dataSync.forceSync) {
      this.loggerService.info({
        context: 'handleResponseAutoSyncSuccess.deleteManyAnnotationOfDocument',
        extraInfo: { documentId },
      });
      deleteAnnotsPromise = this.documentService.deleteManyAnnotationOfDocument(
        { documentId },
      );
    } else {
      const totalAnnots = await this.documentService.countDocumentAnnotations(documentId);
      if (totalAnnots > MAX_ANNOTATION_SYNC_COUNT) {
        this.loggerService.info({
          context: 'handleResponseAutoSyncSuccess.deleteManyAnnotationOfDocument',
          extraInfo: { documentId, totalAnnots },
        });
        deleteAnnotsPromise = this.documentService.deleteManyAnnotationOfDocument({ documentId });
      }
    }

    deletePromise.push(deleteAnnotsPromise);
    if (fields.length) {
      const fieldIds = fields.map((field) => field._id);
      deletePromise.push(this.documentService.deleteFormFieldByIds(fieldIds));
    }
    deletePromise.push(this.documentOutlineService.clearOutlineOfDocument(documentId));
    await Promise.allSettled(deletePromise);
    // track user use document
    const [actorInfo, document] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(socket.user._id),
      this.documentService.findOneById(documentId),
    ]);
    const useDocumentEvent: ICreateEventInput = {
      eventName: DocumentEventNames.DOCUMENT_USED,
      eventScope: EventScopes.PERSONAL,
      actor: actorInfo,
      document,
    };
    let manipulationStep = '';
    if (lastManipulationStepId && document.manipulationStep) {
      const manipulationSteps = JSON.parse(document.manipulationStep) as { id: string }[];
      const index = manipulationSteps.findIndex((step) => step.id === lastManipulationStepId);
      if (index !== -1) {
        const newManipulationSteps = manipulationSteps.slice(index + 1);
        if (newManipulationSteps.length > 0) {
          manipulationStep = JSON.stringify(newManipulationSteps);
        }
      }
    }
    this.personalEventService.createUserUseDocumentEvent(useDocumentEvent);
    this.documentService.updateDocument(documentId, {
      manipulationStep,
      ...(document.temporaryRemoteId ? { temporaryRemoteId: '' } : {}),
    });
  }
}
