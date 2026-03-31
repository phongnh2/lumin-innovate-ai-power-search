import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import v4 from 'uuid/v4';

import actions from 'actions';
import selectors from 'selectors';

import { useCurrentTemplateList, useTranslation } from 'hooks';

import { templateServices, uploadServices, googleServices } from 'services';

import {
  toastUtils,
} from 'utils';

import { general } from 'constants/documentType';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { ERROR_MESSAGE_TEMPLATE } from 'constants/messages';

export function usePreUploadTemplate() {
  const dispatch = useDispatch();
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const [templateType, clientId] = useCurrentTemplateList();
  const { t } = useTranslation();

  const openThirdpartyUploadToast = () => toastUtils.openToastMulti({
    message: t('templatePage.driveDropboxFilesNeedMoreTimeToProgress'),
    type: ModalTypes.INFO,
    duration: 2000,
  });

  const preCheckingFileUpload = async (file) => {
    const { name: fileName, type, size } = file;
    const isPDFType = type === general.PDF;
    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(size, true);

    switch (true) {
      case !file:
        return new Error(t(ERROR_MESSAGE_TEMPLATE.TEMPLATE_NOT_FOUND));
      case !isPDFType:
        return new Error(t(ERROR_MESSAGE_TEMPLATE.TEMPLATE_UNSUPPORT_TYPE));
      case !allowedUpload: {
        const pdfSizeError = new Error(ERROR_MESSAGE_TEMPLATE.OVER_TEMPLATE_FILE_SIZE);
        pdfSizeError.metadata = {
          maxSizeAllow,
          fileName,
        };
        return pdfSizeError;
      }
      default:
        break;
    }

    const hasReachedDailyLimit = await templateServices.from(templateType).checkReachDailyTemplateUploadLimit({
      uploaderId: userId,
      refId: clientId,
    });

    if (hasReachedDailyLimit) {
      return new Error(t(ERROR_MESSAGE_TEMPLATE.DAILY_UPLOAD_TEMPLATE_LIMIT));
    }
    return null;
  };

  const getFileData = async ({ file, uploadFrom }) => {
    let thumbnail = '';
    let newFile = file;
    switch (uploadFrom) {
      case STORAGE_TYPE.LOCAL: {
        const { documentInstance, linearizedFile } = await uploadServices.linearPdfFromFiles(file, {
          unlockPassword: true,
          passwordModalMessage: t('templatePage.passwordModalMessage'),
        });
        newFile = linearizedFile;
        thumbnail = await uploadServices.getThumbnailDocument(documentInstance);
      }
        break;
      case STORAGE_TYPE.GOOGLE:
        openThirdpartyUploadToast();
        thumbnail = (await googleServices.getFileInfo(file.id, 'thumbnailLink', 'getFileData'))?.thumbnailLink?.replace('=s220', '=s700');
        break;
      case STORAGE_TYPE.DROPBOX:
        openThirdpartyUploadToast();
        break;
      default:
        break;
    }

    return {
      file: newFile,
      thumbnail,
    };
  };

  const onCreate = async ({
    uploadFrom, name, description, file, thumbnail, isNotify,
  }) => {
    const groupId = v4();
    let newFile = file;
    if (uploadFrom === STORAGE_TYPE.LOCAL) {
      newFile = new File([file], `${name}.pdf`, { type: 'application/pdf' });
    } else {
      newFile.name = `${name}.pdf`;
    }
    dispatch(actions.addUploadingFiles([{
      groupId,
      fileData: {
        uploadFrom,
        name,
        description,
        file: newFile,
        templateType,
      },
      thumbnail,
      entityId: clientId,
      isNotify,
      handlerName: uploadServices.TEMPLATE_HANDLER,
    }]));
  };

  return {
    getFileData, preCheckingFileUpload, onCreate, clientId,
  };
}
