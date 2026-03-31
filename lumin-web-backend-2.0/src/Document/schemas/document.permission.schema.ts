import * as mongoose from 'mongoose';

import WorkspaceSchema from 'Common/schemas/workspace.schema';

import { DocumentPermissionOfMemberEnum, DocumentRoleEnum, DocumentKindEnum } from 'Document/document.enum';
import { IDocumentPermission } from 'Document/interfaces/document.interface';

const DefaultPermissionSchema = new mongoose.Schema({
  member: {
    type: String,
    enum: DocumentPermissionOfMemberEnum,
  },
}, { _id: false });

const DocumentPermission = new mongoose.Schema({
  refId: mongoose.Schema.Types.ObjectId,
  documentId: mongoose.Schema.Types.ObjectId,
  role: {
    type: String,
    enum: DocumentRoleEnum,
  },
  workspace: WorkspaceSchema,
  groupPermissions: {
    type: Object,
    default: {},
  },
  defaultPermission: {
    type: DefaultPermissionSchema,
    default() {
      switch (this.role) {
        case DocumentRoleEnum.ORGANIZATION:
          return {
            member: DocumentPermissionOfMemberEnum.SHARER,
          };
        case DocumentRoleEnum.ORGANIZATION_TEAM:
          return {
            member: DocumentPermissionOfMemberEnum.EDITOR,
          };
        default: return undefined;
      }
    },
  },
  documentKind: {
    type: String,
    enum: DocumentKindEnum,
  },
}, { strict: false });

DocumentPermission.index({ documentId: 1 });
DocumentPermission.index({ role: 1 });
DocumentPermission.index({ refId: 1, role: 1 });

DocumentPermission.index({ 'workspace.refId': 1 });

const validateWorkspace = () => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const doc: Omit<IDocumentPermission, keyof mongoose.Document> = this as any;
  if (doc.role !== DocumentRoleEnum.OWNER && doc.workspace) {
    throw new Error("Workspace can't be used without `owner` role.");
  }
};

DocumentPermission.pre('save', validateWorkspace);
DocumentPermission.pre('updateOne', validateWorkspace);

export default DocumentPermission;
