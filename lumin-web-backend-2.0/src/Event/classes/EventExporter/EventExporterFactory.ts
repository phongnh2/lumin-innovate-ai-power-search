import { ChangePlanExporter } from 'Event/classes/EventExporter/ChangePlanExporter';
import { EventExporterBase } from 'Event/classes/EventExporter/EventExporterBase';
import { InvitationExporter } from 'Event/classes/EventExporter/InvitationExporter';
import { OpenDocExporter } from 'Event/classes/EventExporter/OpenDocExporter';
import { SignInExporter } from 'Event/classes/EventExporter/SignInExporter';
import { SignOutExporter } from 'Event/classes/EventExporter/SignOutExporter';
import { UploadDocExporter } from 'Event/classes/EventExporter/UploadDocExporter';
import {
  DocumentEventNames, ExportPrefixEnums, NonDocumentEventNames, EventNameType,
} from 'Event/enums/event.enum';
import { User } from 'User/interfaces/user.interface';

export class EventExporterFactory {
  static EventNamePrefixMapping = new Map<string, ExportPrefixEnums>([
    [DocumentEventNames.DOCUMENT_UPLOADED, ExportPrefixEnums.UPLOADED_DOC],
    [DocumentEventNames.DOCUMENT_OPENED, ExportPrefixEnums.OPENED_DOC],
    [NonDocumentEventNames.TEAM_PLAN_CHANGED, ExportPrefixEnums.CHANGED_PLAN],
    [NonDocumentEventNames.PERSONAL_PLAN_CHANGED, ExportPrefixEnums.CHANGED_PLAN],
    [NonDocumentEventNames.TEAM_MEMBER_ADDED, ExportPrefixEnums.INVITATION],
    [NonDocumentEventNames.PERSONAL_SIGNED_IN, ExportPrefixEnums.SIGNED_IN],
    [NonDocumentEventNames.PERSONAL_SIGNED_OUT, ExportPrefixEnums.SIGNED_OUT],
  ]);

  static getInstances(eventNames: EventNameType | EventNameType[], user: User) : EventExporterBase {
    let prefix : ExportPrefixEnums = null;
    if (eventNames instanceof Array) {
      for (let i = 0; i < eventNames.length; i++) {
        if (prefix !== null && prefix !== EventExporterFactory.EventNamePrefixMapping.get(eventNames[i])) {
          throw new Error('Event has not been mapped!');
        }
        prefix = EventExporterFactory.EventNamePrefixMapping.get(eventNames[i]);
      }
    } else {
      prefix = EventExporterFactory.EventNamePrefixMapping.get(eventNames);
    }
    switch (prefix) {
      case ExportPrefixEnums.UPLOADED_DOC:
        return new UploadDocExporter(user);
      case ExportPrefixEnums.OPENED_DOC:
        return new OpenDocExporter(user);
      case ExportPrefixEnums.CHANGED_PLAN:
        return new ChangePlanExporter(user);
      case ExportPrefixEnums.INVITATION:
        return new InvitationExporter(user);
      case ExportPrefixEnums.SIGNED_IN:
        return new SignInExporter(user);
      case ExportPrefixEnums.SIGNED_OUT:
        return new SignOutExporter(user);
      default:
        return null;
    }
  }
}
