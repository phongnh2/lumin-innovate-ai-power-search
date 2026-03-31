import { IconButton, Icomoon, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetFolderType } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import { FolderServices } from 'services';

import { folderType as tabType } from 'constants/documentConstants';
import { FolderType } from 'constants/folderConstant';

import { IFolder } from 'interfaces/folder/folder.interface';

interface DocumentItemStarProps {
  folder: IFolder;
  folderType?: typeof FolderType[keyof typeof FolderType];
  isStarred: boolean;
  size: ButtonSize;
  disabled: boolean;
  isOutsideDocumentList?: boolean;
}

const defaultProps: Partial<DocumentItemStarProps> = {
  folderType: FolderType.PERSONAL,
};

const FolderItemStar = (props: DocumentItemStarProps) => {
  const { folder, folderType, isStarred, size, disabled, isOutsideDocumentList } = { ...defaultProps, ...props };

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentFolderType = useGetFolderType();

  const toolTipContent = isStarred ? t('folderSection.removeFromStarred') : t('folderSection.addToStarred');

  const handleClickStar = useCallback(async () => {
    const folderServices = new FolderServices(folderType);
    const newFolder = await folderServices.starFolder(folder._id);
    if (!isOutsideDocumentList) {
      dispatch(actions.updateFolderInList({ newFolder, isStarTab: currentFolderType === tabType.STARRED }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderType, folder._id, folderType]);

  return (
    <PlainTooltip content={toolTipContent} disabled={disabled}>
      <IconButton
        icon={
          isStarred ? (
            <Icomoon type={`star-fill-${size}`} color="var(--kiwi-colors-custom-brand-tools-esign)" />
          ) : (
            <Icomoon type={`star-${size}`} color="var(--kiwi-colors-surface-on-surface-variant)" />
          )
        }
        size={size}
        data-button-star-id={folder._id}
        data-cy={`${isStarred ? 'unstar' : 'star'}_button`}
        onClick={handleClickStar}
        style={{ zIndex: 2 }}
        disabled={disabled}
      />
    </PlainTooltip>
  );
};

export default FolderItemStar;
