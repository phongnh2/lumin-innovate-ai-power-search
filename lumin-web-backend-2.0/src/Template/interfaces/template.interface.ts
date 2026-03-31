import { TemplateRole } from 'Template/template.enum';

export interface ITemplateModel {
  name: string;
  size: number;
  remoteId: string;
  ownerId: string;
  ownerType: string;
  description: string;
  // eslint-disable-next-line no-use-before-define
  counter: ICounter;
  thumbnail?: string;
  createdAt?: Date;
}

export interface ICounter {
  view?: number,
  download?: number
}

export interface ITemplatePermissionModel {
  refId: string;
  templateId: string;
  role: TemplateRole;
  groupPermissions?: Record<string, any>;
}

export interface ITemplate extends ITemplateModel {
  _id: string;
}

export interface ITemplatePermission extends ITemplatePermissionModel {
  _id: string;
}
