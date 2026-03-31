import { NotiDocumentInterface } from 'Common/factory/NotiFactory/NotiDocument/noti.document.interface';
import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiDocumentBase } from './noti.base.document';

export class NotiRestoreOriginalDocument extends NotiDocumentBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {
    super(notiDocument);
  }

  createTarget(): NotiTarget {
    return null;
  }
}
