import { useSubscription } from '@apollo/client';
import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { SUB_DELETE_ORIGINAL_DOCUMENT } from 'graphQL/DocumentGraph';

import selectors from 'selectors';

import { commonUtils } from 'utils';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { STATUS_CODE } from 'constants/lumin-common';

import { IUser } from 'interfaces/user/user.interface';

function withDeleteCachedFile<T>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

    useSubscription(SUB_DELETE_ORIGINAL_DOCUMENT, {
      variables: {
        clientId: currentUser?._id || '',
      },
      skip: !currentUser,
      onSubscriptionData: ({
        subscriptionData: {
          data: { deleteOriginalDocument },
        },
      }) => {
        if (!deleteOriginalDocument) {
          return;
        }
        const { statusCode, documentList: deletedDocList } = deleteOriginalDocument as {
          statusCode: number;
          documentList: { documentId: string }[];
        };
        if (statusCode === STATUS_CODE.SUCCEED) {
          documentCacheBase.deleteMultiple(deletedDocList.map((document) => getCacheKey(document.documentId)));
        }
      },
    });

    return <Component {...props} />;
  }

  HOC.displayName = commonUtils.getHOCDisplayName('withDeleteCachedFile', Component);

  return HOC;
}

export default withDeleteCachedFile;
