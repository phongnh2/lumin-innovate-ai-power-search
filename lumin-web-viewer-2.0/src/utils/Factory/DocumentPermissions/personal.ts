/* eslint-disable class-methods-use-this */
import { DocumentPermissionBase } from './base';

export class DocumentPermissionPersonal extends DocumentPermissionBase {
  canUpdateShareSetting(): void {
    throw new Error('Method not implemented.');
  }
}
