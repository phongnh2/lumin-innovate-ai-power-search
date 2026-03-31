import { DocumentRole } from 'constants/documentConstants';

export const RequestPermissionText = {
  [DocumentRole.SPECTATOR]: 'view',
  [DocumentRole.VIEWER]: 'comment',
  [DocumentRole.EDITOR]: 'edit',
  [DocumentRole.SHARER]: 'share',
};

export type TRequestPermission = string;

export const MAX_REQUEST_ACCESS_ITEMS = 10;
