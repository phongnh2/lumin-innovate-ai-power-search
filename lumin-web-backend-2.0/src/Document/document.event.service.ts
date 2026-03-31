import { Injectable } from '@nestjs/common';
import { get } from 'lodash';

import { DocumentEventNames, EventScopes } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { Document, RatingModalStatus } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';
import { DocViewerInteractionType } from 'User/user.enum';

import { DocumentService } from './document.service';

@Injectable()
export class DocumentEventService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly eventService: EventServiceFactory,
  ) {}

  async openDocument(params: { document: Document; user: User }) {
    const { document, user } = params;
    const documentScope = document.isPersonal
      ? EventScopes.PERSONAL
      : EventScopes.TEAM;
    this.eventService.createEvent({
      eventName: DocumentEventNames.DOCUMENT_OPENED,
      actor: user,
      eventScope: documentScope,
      document,
    });

    const googleModalStatus = get(
      user,
      'metadata.rating.googleModalStatus',
    );
    if (
      !googleModalStatus
        || googleModalStatus === RatingModalStatus.NEVER_INTERACT
    ) {
      await this.documentService.handleUpdateDocViewerInteraction(
        user._id,
        DocViewerInteractionType.TOTAL_OPENED_DOC,
      );
    }
  }
}
