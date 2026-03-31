import uploadServices from 'services/uploadServices';

import logger from 'helpers/logger';

import compressImage from 'utils/compressImage';
import fileUtil from 'utils/file';

export default async ({ file, documentInstance }) => {
  if (!documentInstance) {
    return null;
  }
  if (fileUtil.isImage(file) && file instanceof File) {
    return compressImage(file, {
      mimeType: 'jpeg',
      convertSize: 0,
      maxWidth: 800,
      maxHeight: 400,
    });
  }
  try {
    return await uploadServices.getThumbnailDocument(documentInstance);
  } catch (error) {
    logger.logError({
      message: JSON.stringify(error),
    });
    return null;
  }
};
