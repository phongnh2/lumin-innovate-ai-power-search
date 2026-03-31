import documentObservable from 'lumin-components/DocumentQuery/DocumentObserver/DocumentObservable';

import { socket } from '@socket';

import { documentStorage } from 'constants/documentConstants';
import { DOCUMENT_LINK_TYPE } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface UpdateShareSetting {
  permission: string;
  linkType: string;
}

export const handleUpdateShareSettingDocument = ({
  currentDocument,
  updateDocument,
  updateShareSetting,
}: {
  currentDocument: IDocumentBase;
  updateDocument: (doc: IDocumentBase) => void;
  updateShareSetting: UpdateShareSetting;
}) => {
  if (updateShareSetting.linkType === DOCUMENT_LINK_TYPE.INVITED) {
    socket.emit(SOCKET_EMIT.CHANGE_SHARE_SETTING, { documentId: currentDocument._id, invited: true });
  } else if (updateShareSetting.permission !== currentDocument.shareSetting.permission) {
    socket.emit(SOCKET_EMIT.CHANGE_SHARE_SETTING, {
      documentId: currentDocument._id,
      role: updateShareSetting.permission,
    });
  }

  const updatedDocument = {
    ...currentDocument,
    service: documentStorage.s3,
    shareSetting: {
      ...currentDocument.shareSetting,
      permission: updateShareSetting.permission,
      linkType: updateShareSetting.linkType,
    },
  } as IDocumentBase;

  documentObservable.notify({
    event: SubscriptionConstants.Subscription.DOCUMENT_SETTINGS,
    data: {
      document: updatedDocument,
    },
  });
  updateDocument(updatedDocument);
};
