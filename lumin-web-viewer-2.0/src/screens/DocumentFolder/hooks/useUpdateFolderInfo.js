import { useSubscription } from '@apollo/client';
import produce from 'immer';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { SUB_UPDATE_FOLDER } from 'graphQL/FolderGraph';

import actions from 'actions';

import { useEnableWebReskin, useGetCurrentUser, useTranslation } from 'hooks';

import { string as stringUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import SubscriptionConstants from 'constants/subscriptionConstant';

const { Subscription } = SubscriptionConstants;

export function useUpdateFolderInfo(currentFolder, setFolderInfoHandler) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const { isEnableReskin } = useEnableWebReskin();

  const informFolderRemoved = (folder) => {
    const modalData = {
      title: t('modalFolder.folderHasBeenDeletedTitle'),
      message: (
        <Trans
          i18nKey="modalFolder.folderHasBeenDeletedMessage"
          values={{ folderName: stringUtils.getShortString(folder.name) }}
          components={{ b: <b className="bold" /> }}
        />
      ),
      type: isEnableReskin ? '' : ModalTypes.WARNING,
      isFullWidthButton: !isEnableReskin,
      confirmButtonProps: {
        title: t('common.ok'),
        ...(isEnableReskin && {
          withExpandedSpace: true,
        }),
      },
      onConfirm: () => navigate(Routers.DOCUMENTS),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalData));
  };

  const handleUpdateFolderSubscription = ({ folder, subscriptionEvent, actorId }) => {
    switch (subscriptionEvent) {
      case Subscription.DELETE_FOLDER:
        if (actorId !== currentUser._id) {
          informFolderRemoved(folder);
        }
        break;

      case Subscription.UPDATE_FOLDER_INFO:
      case Subscription.UPDATE_STARRED_FOLDER:
        setFolderInfoHandler((prevFolderDetail) =>
          produce(prevFolderDetail, (draftFolder) => {
            Object.assign(draftFolder, folder);
          })
        );
        break;

      default:
        break;
    }
  };

  useSubscription(SUB_UPDATE_FOLDER, {
    variables: {
      input: {
        userId: currentUser._id,
        folderId: currentFolder?._id,
      },
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { updateFolderSubscription },
      },
    }) => {
      if (!updateFolderSubscription) {
        return;
      }
      const { folder, subscriptionEvent, actorId } = updateFolderSubscription;
      if (currentFolder._id === folder._id) {
        handleUpdateFolderSubscription({ folder, subscriptionEvent, actorId });
      }
    },
  });
}
