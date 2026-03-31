import {
  NotiDocument,
  NotificationType,
} from 'Common/constants/NotificationConstants';

import { NotiFirebaseDocumentInterface } from './noti.firebase.document.interface';
import { NotiFirebaseAbstractFactory } from '../noti.firebase.abstract.factory';
import { NotiFirebaseInterface } from '../noti.firebase.interface';
import { NotiFirebaseAcceptRequestAccessDocument } from './Product/noti.firebase.accept-request-access.document';
import { NotiFirebaseDocumentBase } from './Product/noti.firebase.base.document';
import { NotiFirebaseDeleteDocument } from './Product/noti.firebase.delete.document';
import { NotiFirebaseRemoveSharedUserDocument } from './Product/noti.firebase.remove-share-user.document';
import { NotiFirebaseRequestAccessDocument } from './Product/noti.firebase.request-access.document';
import { NotiFirebaseRestoreDocumentVersionDocument } from './Product/noti.firebase.restore-document-version.document';
import { NotiFirebaseShareDocument } from './Product/noti.firebase.share.document';
import { NotiFirebaseUpdateAnnotationOfAnotherDocument } from './Product/noti.firebase.update-annotation-of-another.document';
import { NotiFirebaseUpdateUserPermissionDocument } from './Product/noti.firebase.update-user-permission.document';
import { NotiFirebaseUploadDocumentOrganization } from './Product/noti.firebase.upload.document-organization';
import { NotiFirebaseUploadDocumentTeam } from './Product/noti.firebase.upload.document-team';

export class NotiFirebaseDocumentFactory extends NotiFirebaseAbstractFactory {
  public create(
    type: number,
    notificationFirebase: Partial<NotiFirebaseDocumentInterface>,
  ): NotiFirebaseInterface {
    const notificationInitialize = {
      ...notificationFirebase,
      notificationData: {
        actionType: type.toString(),
        notificationType: NotificationType.DOCUMENT,
      },
      notificationContent: {
        title: 'Lumin PDF',
      },
    } as NotiFirebaseDocumentInterface;

    let ConstructType: new (
      noti: NotiFirebaseInterface,
    ) => NotiFirebaseDocumentBase;

    switch (type) {
      case NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION:
        ConstructType = NotiFirebaseUploadDocumentOrganization;
        break;
      case NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM:
        ConstructType = NotiFirebaseUploadDocumentTeam;
        break;
      case NotiDocument.SHARE:
        ConstructType = NotiFirebaseShareDocument;
        break;
      case NotiDocument.DELETE:
        ConstructType = NotiFirebaseDeleteDocument;
        break;
      case NotiDocument.REMOVE_SHARED_USER:
        ConstructType = NotiFirebaseRemoveSharedUserDocument;
        break;
      case NotiDocument.UPDATE_USER_PERMISSION:
        ConstructType = NotiFirebaseUpdateUserPermissionDocument;
        break;
      case NotiDocument.REQUEST_ACCESS:
        ConstructType = NotiFirebaseRequestAccessDocument;
        break;
      case NotiDocument.ACCEPT_REQUEST_ACCESS:
        ConstructType = NotiFirebaseAcceptRequestAccessDocument;
        break;
      case NotiDocument.UPDATE_ANNOT_OF_ANOTHER:
        ConstructType = NotiFirebaseUpdateAnnotationOfAnotherDocument;
        break;
      case NotiDocument.RESTORE_DOCUMENT_VERSION:
        ConstructType = NotiFirebaseRestoreDocumentVersionDocument;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
