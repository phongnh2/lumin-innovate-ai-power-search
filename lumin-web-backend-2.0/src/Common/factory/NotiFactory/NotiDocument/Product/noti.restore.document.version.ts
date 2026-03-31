import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiDocumentInterface } from 'Common/factory/NotiFactory/NotiDocument/noti.document.interface';

// eslint-disable-next-line import/extensions
import { NotiDocumentBase } from './noti.base.document';

export class NotiRestoreDocumentVersion extends NotiDocumentBase {
  constructor(protected readonly notiDocument: NotiDocumentInterface) {
    super(notiDocument);
  }

  createTarget(): NotiTarget {
    return null;
  }
}
