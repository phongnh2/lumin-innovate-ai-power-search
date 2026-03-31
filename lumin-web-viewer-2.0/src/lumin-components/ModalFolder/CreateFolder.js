import PropTypes from 'prop-types';
import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useParams } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentTeam, useTranslation, useEnableWebReskin } from 'hooks';

import { FolderServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { FolderType } from 'constants/folderConstant';

import FolderController from './FolderController';

CreateFolder.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(FolderType)),
};

CreateFolder.defaultProps = {
  type: FolderType.PERSONAL,
};

function CreateFolder({ onClose, type }) {
  const { t } = useTranslation();
  const folderServices = new FolderServices(type);
  const currentTeam = useGetCurrentTeam();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);

  const { isEnableReskin } = useEnableWebReskin();

  const { _id: teamId } = currentTeam || {};
  const { _id: orgId } = currentOrganization.data || {};
  const { folderId } = useParams();

  const onSubmit = async ({ name, activeColor, isNotify }) => {
    try {
      await folderServices.create({
        name,
        color: activeColor,
        teamId,
        orgId,
        isNotify,
        parentId: folderId,
      });
      onClose();
      toastUtils.success({
        message: t('modalFolder.createSuccess'),
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
      title={t('modalFolder.createFolder')}
      onSubmit={onSubmit}
      submitLabel={t('common.create')}
      onClose={onClose}
      isShowNotify
    />
  );
}

export default CreateFolder;
