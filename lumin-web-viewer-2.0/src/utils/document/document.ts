import { DOCUMENT_TYPE } from "constants/documentConstants";
import { IBelongsTo } from "interfaces/document/document.interface";

export class DocumentHelpers {
  static isBelongsToPersonalWorkspace(belongsTo: IBelongsTo): boolean {
    return belongsTo.type === DOCUMENT_TYPE.PERSONAL && !belongsTo.workspaceId;
  }

  static isBelongsToMyDocumentInOrg(belongsTo: IBelongsTo): boolean {
    return belongsTo.type === DOCUMENT_TYPE.PERSONAL && Boolean(belongsTo.workspaceId);
  }

  static isBelongsToOrgOrTeam(belongsTo: IBelongsTo): boolean {
    return belongsTo.type !== DOCUMENT_TYPE.PERSONAL;
  }
}
