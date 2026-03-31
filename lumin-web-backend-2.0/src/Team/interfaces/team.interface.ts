import { Types } from 'mongoose';

import { TemplateWorkspaceEnum } from 'Organization/organization.enum';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';

export interface ITeamSettings {
  templateWorkspace: TemplateWorkspaceEnum;
}

export interface ITeamMetadata {
  hasProcessedIndexingDocuments: boolean;
}

export interface ITeamModel {
  name: string;
  createdAt: Date;
  belongsTo: any;
  avatarRemoteId: string;
  plan: string;
  planPeriod: string;
  planStatus: string;
  ownerId: Types.ObjectId;
  payment: PaymentSchemaInterface;
  endTrial: Date;
  settings: ITeamSettings;
  metadata: ITeamMetadata;
}

export interface ITeam extends ITeamModel {
  _id: string;
}

export interface CreateTeamInput {
  name: string;
  avatarRemoteId: string;
  ownerId: Types.ObjectId;
  belongsTo: any;
}
