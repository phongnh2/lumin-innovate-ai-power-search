import core from 'core';

import exportAnnotations from 'helpers/exportAnnotations';

import { getFileData } from './getFileService';

export const getDocumentSize = async () => {
  await core.getDocument().getDocumentCompletePromise();
  const xfdfString = await exportAnnotations();
  const fileData = await getFileData({ xfdfString });
  return fileData.byteLength;
};
