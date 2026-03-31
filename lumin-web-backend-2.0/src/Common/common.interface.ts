import { HttpStatus } from '@nestjs/common';

import { EmailTagEnum, PolicyEffect } from 'Common/common.enum';

export interface DocumentEmail {
  shareDocument?: boolean;
  commentDocument?: boolean;
  replyCommentDocument?: boolean;
  mentionCommentDocument?: boolean;
  requestAccessDocument?: boolean;
}

export interface OrganizationEmail {
  inviteToOrganization?: boolean;
  inviteToOrganizationTeam?: boolean;
}

export interface Setting {
  marketingEmail?: boolean;
  subscriptionEmail?: boolean;
  otherEmail?: boolean;
  featureUpdateEmail?: boolean;
  dataCollection?: boolean;
  documentEmail: DocumentEmail;
  organizationEmail: OrganizationEmail;
  defaultWorkspace?: string;
}

export interface EmailType {
  category: string;
  description: string;
  tag?: EmailTagEnum,
}

export interface BasicResponse {
  statusCode: HttpStatus;
  message: string;
}

export interface AvatarFile {
  fileBuffer: Buffer;
  mimetype: string;
}

export interface IMonitorHeapUsage {
  hrtime: [number, number];
  heapBefore: globalThis.NodeJS.MemoryUsage;
  taskName: string;
  metadata?: Record<string, unknown>;
}

export type Email = string;

export interface IPermission {
  name: string;
  effect: PolicyEffect;
}
