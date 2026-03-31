import { useSubscription } from '@apollo/client';
import { isNull } from 'lodash';
import React, { useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { SUB_DOCUMENT_SHARING_QUEUE } from 'graphQL/DocumentGraph';

import { useGetCurrentUser, useTranslation } from 'hooks';

import { commonUtils, toastUtils } from 'utils';

import {
  setIsSharingQueueProcessing,
  shareInSlackSelectors,
  setSharedDocumentInfo,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

function withSharingQueue<T>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isSharingQueueProcessing = useSelector(shareInSlackSelectors.getIsSharingQueueProcessing);
    const currentUser = useGetCurrentUser();

    const successMessage = useCallback(
      ({ isChannel, isOverwritePermission }: { isChannel: boolean; isOverwritePermission: boolean }) => {
        if (isNull(isOverwritePermission)) {
          return t('shareInSlack.documentHasBeenShared');
        }
        if (isOverwritePermission) {
          return isChannel ? t('shareInSlack.overrideMultipleUsers') : t('shareInSlack.overrideSingleUser');
        }
        return isChannel ? t('shareInSlack.unChangeMultipleUsers') : t('shareInSlack.unChangeSingleUser');
      },
      []
    );

    useSubscription<{
      documentSharingQueue: {
        isChannelSharing: boolean;
        documentName: string;
        hasUnshareableEmails: boolean;
        isOverwritePermission?: boolean;
        documentId: string;
      };
    }>(SUB_DOCUMENT_SHARING_QUEUE, {
      fetchPolicy: 'no-cache',
      variables: {
        clientId: currentUser?._id,
      },
      skip: !isSharingQueueProcessing || !currentUser,
      onData: ({
        data: {
          data: { documentSharingQueue },
        },
      }) => {
        if (!documentSharingQueue) {
          return;
        }

        const { isChannelSharing, documentName, isOverwritePermission, hasUnshareableEmails, documentId } =
          documentSharingQueue;
        if (hasUnshareableEmails) {
          toastUtils.warn({
            message: (
              <Trans
                i18nKey="shareInSlack.sharingFailedForSomeUsersError"
                components={{ b: <b style={{ fontWeight: '700' }} /> }}
                values={{ docName: documentName }}
              />
            ),
          });
        } else {
          toastUtils.success({ message: successMessage({ isChannel: isChannelSharing, isOverwritePermission }) });
        }
        dispatch(setIsSharingQueueProcessing(false));
        dispatch(setSharedDocumentInfo({ documentId }));
      },
    });

    return <Component {...props} />;
  }

  HOC.displayName = commonUtils.getHOCDisplayName('withSharingQueue', Component);

  return HOC;
}

export default withSharingQueue;
