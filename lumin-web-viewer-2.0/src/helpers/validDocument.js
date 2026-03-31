import { file as fileUtils } from 'utils';
import mime from 'utils/mime-types';

import { extensions } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

const isValidDocumentToSign = (currentUser, currentDocument) => {
  if (!currentUser || !currentDocument) {
    return false;
  }
  const fileType = fileUtils.getExtension(currentDocument.name) || mime.extension(currentDocument.mimeType);
  switch (currentDocument.service) {
    case STORAGE_TYPE.CACHING:
    case STORAGE_TYPE.DROPBOX:
    case STORAGE_TYPE.ONEDRIVE:
    case STORAGE_TYPE.GOOGLE:
    case STORAGE_TYPE.S3: {
      return true;
    }
    case STORAGE_TYPE.SYSTEM: {
      return fileType === extensions.PDF;
    }
    default:
      return false;
  }
};

export { isValidDocumentToSign };
