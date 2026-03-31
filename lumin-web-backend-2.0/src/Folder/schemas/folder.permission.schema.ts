import * as mongoose from 'mongoose';

import WorkspaceSchema from 'Common/schemas/workspace.schema';

import { FolderRoleEnum } from 'Folder/folder.enum';
import { IFolderPermission } from 'Folder/interfaces/folder.interface';

const FolderPermission = new mongoose.Schema({
  refId: mongoose.Schema.Types.ObjectId,
  folderId: mongoose.Schema.Types.ObjectId,
  role: {
    enum: FolderRoleEnum,
    type: String,
  },
  workspace: WorkspaceSchema,
});

FolderPermission.index({ folderId: 1 });
FolderPermission.index({ 'workspace.refId': 1, role: 1 });
FolderPermission.index({ refId: 1, role: 1 });

const validateWorkspace = () => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const doc: Omit<IFolderPermission, keyof mongoose.Document> = this as any;
  if (doc.role !== FolderRoleEnum.OWNER && doc.workspace) {
    throw new Error("Workspace can't be used without `owner` role.");
  }
};

FolderPermission.pre('save', validateWorkspace);
FolderPermission.pre('updateOne', validateWorkspace);

export default FolderPermission;
