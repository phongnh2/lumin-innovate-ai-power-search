/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { isEmpty, isNil, omitBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { useMatch, useNavigate } from 'react-router';
import v4 from 'uuid/v4';

import actions from 'actions';
import selectors from 'selectors';

import getThumbnail from 'luminComponents/UploadHandler/utils/getThumbnail';

import { systemFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';

import useGetCurrentTeam from 'hooks/useGetCurrentTeam';
import useGetFolderType from 'hooks/useGetFolderType';
import { useShallowSelector } from 'hooks/useShallowSelector';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';
import { useTranslation } from 'hooks/useTranslation';

import uploadServices from 'services/uploadServices';

import checkDocumentType from 'utils/checkDocumentType';
import getFileService from 'utils/getFileService';
import toastUtils from 'utils/toastUtils';
import UploadUtils from 'utils/uploadUtils';

import { folderType, DocumentRole, DOCUMENT_TYPE, DocumentFromSourceEnum } from 'constants/documentConstants';
import { office, general, images } from 'constants/documentType';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { ROUTE_MATCH } from 'constants/Routers';

import { DropDocumentPopupContext } from './withDropDocPopupProvider';

const showUploadFailedToast = ({ t }) => {
  toastUtils.openToastMulti({
    type: ModalTypes.ERROR,
    message: t('toast.filesToUpload'),
    useReskinToast: true,
  });
};

const withDropDocPopupConsumer = (Component) => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const HOC = (props) => {
    // folderInProp: Folder in the document list (URL does not include 'folder')
    const { disabled, folder: folderInProp, ...rest } = props;
    const {
      setName,
      onUpload,
      canUpload,
      // folderInContext: DocumentFolder page (isFolderDocumentRoute: true)
      folder: folderInContext,
      isDropOnFolder,
      setDropOnFolder,
      setFolderDraggingOver,
      setNameFolders,
      nameFolders,
    } = useContext(DropDocumentPopupContext);
    const folder = folderInProp || folderInContext;
    const currentDocument = useShallowSelector(selectors.getCurrentDocument);
    const folderId = folder?._id || currentDocument?.folderId;
    const isPersonalDocument = Boolean(useMatch({ path: ROUTE_MATCH.DOCUMENTS, end: false }));
    const { isTemplatesPage } = useTemplatesPageMatch();
    const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
    const currentFolderType = useGetFolderType();
    const currentTeam = useGetCurrentTeam() || {};
    const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getPopupContent = () => {
      if (folder && folder.name) {
        return `${folder.name}`;
      }
      let name = null;
      switch (currentFolderType) {
        case folderType.INDIVIDUAL: {
          name =
            `${isTemplatesPage ? t('documentPage.reskin.uploadDocument.myTemplatesOf') : t('documentPage.reskin.uploadDocument.myDocumentsOf')} ` +
            `${isPersonalDocument ? currentUser.name : currentOrganization.name}`;
          break;
        }
        case folderType.TEAMS:
          name = `${currentTeam.name}`;
          break;
        case folderType.ORGANIZATION:
          name = `All ${currentOrganization.name}`;
          break;
        default:
          break;
      }
      return name;
    };

    useEffect(() => {
      const folderData = Object.entries(nameFolders)[0];
      setFolderDraggingOver(folderData ? { _id: folderData[0], name: folderData[1] } : null);
    }, [nameFolders]);

    const onDropStateChanged = (isHover) => {
      if (!isEmpty(folderInProp)) {
        setNameFolders((prev) => omitBy({ ...prev, [folderInProp._id]: isHover ? folderInProp?.name : null }, isNil));
        setDropOnFolder(isHover);
      } else {
        setName(isHover ? getPopupContent() : null);
        setDropOnFolder(false);
      }
    };

    const onOpenDocument = async (document) => {
      if (document.fileHandle && (await systemFileHandler.preCheckSystemFile(document.fileHandle))) {
        navigate(`/viewer/${document._id}`);
      }
    };

    const onUploadLocalFiles = async (files, checked) => {
      if (checked) {
        localStorage.setItem(LocalStorageKey.PREVENT_UPLOAD_SYSTEM_FILE_WARNING, true);
      }
      for (const fileHandle of files) {
        const file = await fileHandle.getFile();
        const ext = file.name.split('.').slice(-1)[0]?.toUpperCase();
        const mimeType = file.type || office[ext] || general[ext] || images[ext];
        if (checkDocumentType(mimeType)) {
          const groupId = v4();
          const fileId = `system-${v4()}`;
          let status = UploadUtils.UploadStatus.COMPLETED;
          let errorMessage = '';
          const newDocument = {
            _id: fileId,
            fileHandle,
            name: file.name,
            size: file.size,
            isPersonal: true,
            mimeType,
            createdAt: new Date().getTime(),
            ownerName: currentUser.name,
            roleOfDocument: DocumentRole.OWNER,
            service: STORAGE_TYPE.SYSTEM,
            documentType: DOCUMENT_TYPE.PERSONAL,
            thumbnail: '',
            lastAccess: file.lastModified,
            isStarred: false,
            fromSource: DocumentFromSourceEnum.USER_UPLOAD,
            metadata: {},
          };
          const existedFile = await systemFileHandler.findSystemDocument(newDocument);
          if (existedFile) {
            newDocument.thumbnail = existedFile.thumbnail;
            status = UploadUtils.UploadStatus.ERROR;
            errorMessage = (
              <>
                The file already exists.{' '}
                <span className="open-document" onClick={() => onOpenDocument(existedFile)} role="button" tabIndex={0}>
                  Open it.
                </span>
              </>
            );
          } else {
            const { objectURL, documentInstance } = await uploadServices.getDocumentInstanceFromFile(file);

            const thumbnail = await getThumbnail({ file, documentInstance });
            if (thumbnail) {
              const response = new Response(thumbnail, {
                status: 200,
                headers: {
                  'Content-Type': thumbnail.type,
                },
              });
              const thumbnailUrl = `thumbnails/system/${v4()}.jpeg`;
              await storageHandler.putCustomFile(
                `${getFileService.getThumbnailUrl(thumbnailUrl)}?v=${fileId}`,
                response
              );
              newDocument.thumbnail = thumbnailUrl;
            }
            URL.revokeObjectURL(objectURL);
            await systemFileHandler.insert([newDocument]);
          }
          dispatch(
            actions.addUploadingFiles([
              {
                groupId,
                fileData: {
                  file: {
                    name: newDocument.name,
                  },
                },
                thumbnail: newDocument.thumbnail,
                status,
                errorMessage,
              },
            ])
          );
        } else {
          dispatch(
            actions.addUploadingFiles([
              {
                groupId: v4(),
                fileData: {
                  file: {
                    name: file.name,
                  },
                },
                thumbnail: null,
                status: UploadUtils.UploadStatus.ERROR,
                errorMessage: t('viewer.fileTypeIsNotSupported'),
              },
            ])
          );
        }
      }
    };

    const onUploadFiles = useCallback(
      async (files, uploadFrom = STORAGE_TYPE.LOCAL) => {
        if (!files) {
          return;
        }
        const fileUploads = files.filter(Boolean);
        if (!fileUploads.length) {
          showUploadFailedToast({ t });
          return;
        }
        if (fileUploads.length !== files.length) {
          showUploadFailedToast({ t });
          return;
        }
        if (uploadFrom === STORAGE_TYPE.SYSTEM) {
          const preventWarning = localStorage.getItem(LocalStorageKey.PREVENT_UPLOAD_SYSTEM_FILE_WARNING);
          if (preventWarning) {
            onUploadLocalFiles(files);
            return;
          }
          let modalMessage = '';
          let title = '';
          if (files.length === 1) {
            title = t('uploadLocalFile.title');
            modalMessage = (
              <Trans i18nKey="uploadLocalFile.message" values={{ fileName: files[0].name }} components={{ b: <b /> }} />
            );
          } else {
            title = t('uploadLocalFiles.title');
            modalMessage = t('uploadLocalFiles.message');
          }
          const modalSettings = {
            type: ModalTypes.INFO,
            title,
            message: modalMessage,
            confirmButtonTitle: t('action.upload'),
            onCancel: () => {},
            onConfirm: (checked) => {
              onUploadLocalFiles(files, checked);
            },
            checkboxMessage: t('common.doNotShowAgain'),
            useReskinModal: true,
          };
          dispatch(actions.openModal(modalSettings));
        } else {
          if (isDropOnFolder && !folderId) {
            setDropOnFolder(false);
            return;
          }
          onUpload(
            fileUploads.map((file) => ({ file, uploadFrom })),
            folderId
          );
        }
      },
      [isDropOnFolder, folderId]
    );

    return (
      <Component
        {...rest}
        folderId={folderId}
        onFilesPicked={onUploadFiles}
        disabled={!canUpload || disabled}
        onDropStateChanged={onDropStateChanged}
      />
    );
  };
  HOC.propTypes = {
    disabled: PropTypes.bool,
    folder: PropTypes.object,
    title: PropTypes.string,
    children: PropTypes.node,
  };

  HOC.defaultProps = {
    disabled: false,
    folder: null,
    title: '',
    children: null,
  };

  return HOC;
};

export default withDropDocPopupConsumer;
