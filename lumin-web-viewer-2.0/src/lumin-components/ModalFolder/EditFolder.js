import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { DocumentContext } from 'luminComponents/Document/context';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { FolderServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { useCheckCurrentFolderPage } from 'features/NestedFolders/hooks';

import { FolderType } from 'constants/folderConstant';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

import FolderController from './FolderController';

EditFolder.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(FolderType)),
  folder: PropTypes.object.isRequired,
};

EditFolder.defaultProps = {
  type: FolderType.PERSONAL,
};

function EditFolder({ onClose, type, folder }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const { handleSelectedItems, lastSelectedDocIdRef, selectedFolders } = useContext(DocumentContext);
  const isCurrentFolderPage = useCheckCurrentFolderPage(folder);

  const folderServices = new FolderServices(type);

  const onSubmit = async ({ name, activeColor }) => {
    try {
      await folderServices.edit({ name, color: activeColor, folderId: folder._id });
      if (isEnableReskin && !isCurrentFolderPage) {
        const updatedFolder = { ...selectedFolders[0], name };
        handleSelectedItems({
          currentItem: updatedFolder,
          lastSelectedDocId: lastSelectedDocIdRef.current,
          checkboxType: CHECKBOX_TYPE.SELECT_ONE,
        });
      }
      onClose();
      toastUtils.success({
        message: t('modalFolder.editSuccess'),
        useReskinToast: isEnableReskin,
      });
    } catch (error) {
      toastUtils.openUnknownErrorToast({ useReskinToast: isEnableReskin });
      const { message } = errorUtils.extractGqlError(error);
      logger.logError({ error, message });
    }
  };

  return (
    <FolderController
      title={t(isEnableReskin ? 'modalFolder.renameFolder' : 'modalFolder.editFolder')}
      onSubmit={onSubmit}
      submitLabel={t('common.save')}
      onClose={onClose}
      defaultName={folder.name}
      defaultColor={folder.color}
      type={type}
      isEditFolder
    />
  );
}

export default EditFolder;
