import { isEqual, uniqWith } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

import { DocumentImportParams, InfoDocumentExisted } from 'interfaces/document/document.interface';

import useEnableWebReskin from './useEnableWebReskin';
import { useTranslation } from './useTranslation';
import { useViewerMatch } from './useViewerMatch';

type ModalContentPayload = {
  type: string;
  title: string;
  confirmButtonTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  message: unknown;
  useReskinModal?: boolean;
};

type ModalContentParams = {
  documentInfos: InfoDocumentExisted[];
  handleUploadFile: () => Promise<void>;
};

type FilterSameDestinationParams = {
  documentInfo: InfoDocumentExisted;
  destinationFolderId: string;
  destinationOrgId: string;
};

type HandlePickFileParams = {
  documents: DocumentImportParams[];
  handleUploadFile: () => Promise<void>;
  destinationFolderId: string;
  destinationOrgId: string;
};

type Payload = {
  handlePickThirdPartyFile: (props: HandlePickFileParams) => Promise<void>;
};

const useHandlePickThirdPartyFile = (): Payload => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isViewer } = useViewerMatch();
  const { isEnableReskin } = useEnableWebReskin();

  const getDocumentLocation = (documentInfo: InfoDocumentExisted): { text: string; url: string } => {
    const { organization, folder } = documentInfo;
    const { url: orgUrl, name: orgName } = organization || {};
    const { _id: folderId, name: folderName } = folder || {};

    if (folder) {
      return {
        text: organization
          ? t('modalExistedFile.folderInOrg', { folderName, orgName })
          : t('modalExistedFile.folderInPersonal', { folderName }),
        url: organization
          ? `/${ORG_TEXT}/${orgUrl}/documents/personal/folder/${folderId}`
          : `/documents/personal/folder/${folderId}`,
      };
    }

    return {
      text: organization
        ? t('modalExistedFile.documentsInOrg', { orgName })
        : t('modalExistedFile.documentsInPersonal'),
      url: organization ? `/${ORG_TEXT}/${orgUrl}/documents/personal` : Routers.PERSONAL_DOCUMENT,
    };
  };

  const getModalMessage = (documentInfos: InfoDocumentExisted[]): JSX.Element => {
    const isMultiFile = documentInfos.length > 1;
    const docInfosAfterRemoveDuplicate = uniqWith(documentInfos, isEqual);
    const locations = docInfosAfterRemoveDuplicate.map((_doc) => getDocumentLocation(_doc));
    const reskinStyles = isEnableReskin
      ? {
          fontWeight: 700,
          color: 'var(--kiwi-colors-surface-on-surface)',
          wordBreak: 'break-word',
        }
      : {};
    const descriptions = locations.map((item, index) => (
      <React.Fragment key={index}>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', ...reskinStyles } as React.CSSProperties}
        >
          <b>{item.text}</b>
          {index !== documentInfos.length - 1 && ','}
        </a>
        {index !== documentInfos.length - 1 && ' '}
      </React.Fragment>
    ));

    return (
      <span>
        <Trans
          i18nKey={isMultiFile ? 'modalExistedFile.messageMultiFile' : 'modalExistedFile.message'}
          components={[<span key="descriptions">{descriptions}</span>]}
        />
      </span>
    );
  };

  const handleConfirm = async (handleUploadFile: () => Promise<void>): Promise<void> => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );

    try {
      await handleUploadFile();
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.HANDLE_PICK_THIRD_PARTY_FILE,
        error: error as Error,
      });
      enqueueSnackbar({
        message: t('common.somethingWentWrong'),
        variant: 'error',
      });
    } finally {
      dispatch(
        actions.updateModalProperties({
          isProcessing: false,
        })
      );
    }
  };

  const getModalContent = ({ documentInfos, handleUploadFile }: ModalContentParams): ModalContentPayload => {
    const isMultiFile = documentInfos.length > 1;

    return {
      type: isEnableReskin ? '' : ModalTypes.WARNING,
      title: isMultiFile ? t('modalExistedFile.titleMultiFile') : t('modalExistedFile.title'),
      message: getModalMessage(documentInfos),
      confirmButtonTitle: isMultiFile ? t('modalExistedFile.moveThemHere') : t('modalExistedFile.moveItHere'),
      onConfirm: () => handleConfirm(handleUploadFile),
      onCancel: () => {},
    };
  };

  const filterSameDestination = ({
    documentInfo,
    destinationFolderId,
    destinationOrgId,
  }: FilterSameDestinationParams): boolean => {
    const { organization, folder } = documentInfo;
    const { _id: orgId } = organization || {};
    const { _id: folderId } = folder || {};

    const isSameFolder = folder && folderId === destinationFolderId;
    const isSameOrganization = !folderId && !destinationFolderId && organization && orgId === destinationOrgId;
    const isSamePersonalWorkspace = !orgId && !folderId && !destinationFolderId && !destinationOrgId;

    return isSameFolder || isSameOrganization || isSamePersonalWorkspace;
  };

  const handlePickThirdPartyFile = async ({
    documents,
    handleUploadFile,
    destinationFolderId,
    destinationOrgId,
  }: HandlePickFileParams): Promise<void> => {
    try {
      const remoteIds = documents.map((_doc) => _doc.remoteId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const documentInfos = await documentServices.checkThirdPartyStorage({ remoteIds });

      // Filter documents are in the destination that the user wants to move to
      const docsAreInDestination = documentInfos.filter((item) =>
        filterSameDestination({ documentInfo: item, destinationFolderId, destinationOrgId })
      );

      if (!documentInfos.length || docsAreInDestination.length === documentInfos.length) {
        await handleUploadFile();
        return;
      }

      const modalSettings = getModalContent({ documentInfos, handleUploadFile });
      if (isViewer) {
        dispatch(actions.openViewerModal(modalSettings));
      } else {
        dispatch(actions.openModal({ ...modalSettings, useReskinModal: true }));
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.HANDLE_PICK_THIRD_PARTY_FILE,
        error: error as Error,
      });
      enqueueSnackbar({
        message: t('common.somethingWentWrong'),
        variant: 'error',
      });
    }
  };

  return { handlePickThirdPartyFile };
};

export default useHandlePickThirdPartyFile;
