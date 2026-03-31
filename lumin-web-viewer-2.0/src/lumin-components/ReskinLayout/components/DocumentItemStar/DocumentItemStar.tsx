import { IconButton, Icomoon, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { socket } from 'socket';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useTranslation } from 'hooks/useTranslation';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import { STORAGE_TYPE } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface DocumentItemStarProps {
  document: IDocumentBase;
  isStarred: boolean;
  disabled: boolean;
  size: ButtonSize;
}

const DocumentItemStar = ({ document, isStarred, disabled, size }: DocumentItemStarProps) => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();

  const combineDisabled = useMemo(
    () => disabled || document.service === STORAGE_TYPE.CACHING,
    [document.service, disabled]
  );

  const isSystemFile = useMemo(() => document.service === STORAGE_TYPE.SYSTEM, [document.service]);

  const toolTipContent = isStarred ? t('documentPage.removeFromStarred') : t('documentPage.addToStarred');

  const handleClickStar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!currentUser || combineDisabled) {
      return;
    }

    if (isSystemFile) {
      await systemFileHandler.starFile({ documentId: document._id, isStarred });
      return;
    }
    const clientId = currentUser._id;
    await documentGraphServices.starDocumentMutation({
      document,
      currentUser,
      clientId,
    });
    socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: document._id, type: 'star' });
  };

  return (
    <PlainTooltip content={toolTipContent} disabled={combineDisabled}>
      <IconButton
        icon={
          isStarred ? (
            <Icomoon type={`star-fill-${size}`} color="var(--kiwi-colors-custom-brand-tools-esign)" />
          ) : (
            <Icomoon type={`star-${size}`} color="var(--kiwi-colors-surface-on-surface-variant)" />
          )
        }
        size={size}
        data-button-star-id={document._id}
        disabled={combineDisabled}
        data-cy={`${isStarred ? 'unstar' : 'star'}_button`}
        onClick={handleClickStar}
        style={{ zIndex: 2 }}
      />
    </PlainTooltip>
  );
};

export default DocumentItemStar;
