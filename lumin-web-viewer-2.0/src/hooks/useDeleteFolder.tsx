import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { useEnableWebReskin, useGetCurrentOrganization, useTranslation } from 'hooks';

import { FolderServices } from 'services';

import logger from 'helpers/logger';

import { FolderUtils, toastUtils } from 'utils';
import { getPathnameWithoutLanguage } from 'utils/getLanguage';

import { useCheckCurrentFolderPage } from 'features/NestedFolders/hooks';

import { folderType as DocumentFolderType } from 'constants/documentConstants';
import { CHECKBOX_TYPE, LOGGER, ModalTypes } from 'constants/lumin-common';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import { IFolder } from 'interfaces/folder/folder.interface';

const useDeleteFolder = (
  folderType: string,
  folder: IFolder,
  setRemoveFolderList: ({ type }: { type: string }) => void
) => {
  const { t } = useTranslation();
  const folderServices = new FolderServices(folderType);
  const dispatch = useDispatch();
  const currentOrganization = useGetCurrentOrganization();
  const { isEnableReskin } = useEnableWebReskin();
  const isCurrentFolderPage = useCheckCurrentFolderPage(folder);
  const navigate = useNavigate();

  const handleDelete = async (folderId: string, isNotify: boolean) => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      await folderServices.delete(folderId, isNotify);
      toastUtils.success({
        message: t('modalFolder.deleteSuccess'),
        useReskinToast: true,
      });
      setRemoveFolderList({ type: CHECKBOX_TYPE.DELETE });
      if (isCurrentFolderPage) {
        const lastBreadcrumbId = folder.breadcrumbs[folder.breadcrumbs.length - 1]?._id;
        const currentPath = getPathnameWithoutLanguage();
        const newPath = currentPath.replace(/folder\/[^/]+$/, lastBreadcrumbId ? `folder/${lastBreadcrumbId}` : '');
        navigate(newPath, { replace: true });
      }
    } catch (error: unknown) {
      logger.logError({ error, reason: LOGGER.Service.GRAPHQL_ERROR });
      toastUtils.error({
        message: t('errorMessage.unknownError'),
        useReskinToast: true,
      });
    }
  };

  const openDeleteModal = () => {
    const { _id, name } = folder;
    const shortenFolderName = FolderUtils.shorten(name);
    const isInOrganizationDocList = folderType === DocumentFolderType.ORGANIZATION;
    const modalSetting = {
      type: ModalTypes.WARNING,
      title: t('modalFolder.deleteFolder'),
      message: (
        <Trans
          i18nKey="modalFolder.messageDeleteFolder"
          components={{
            b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} />,
          }}
          values={{ folderName: shortenFolderName }}
        />
      ),
      confirmButtonTitle: t('common.delete'),
      onConfirm: (isNotify: boolean) => handleDelete(_id, isNotify),
      cancelButtonTitle: t('common.cancel'),
      onCancel: () => {},
      checkboxMessage: '',
      useReskinModal: true,
    };
    const { totalActiveMember } = currentOrganization || {};
    const isOverSizeLimitForNoti = totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;
    if (isInOrganizationDocList) {
      modalSetting.checkboxMessage = isOverSizeLimitForNoti
        ? t('notification.notifyAdminThisAction')
        : t('notification.notifyOrgMemberThisAction');
    }
    dispatch(actions.openModal(modalSetting));
  };
  return {
    openDeleteModal,
  };
};

export default useDeleteFolder;
