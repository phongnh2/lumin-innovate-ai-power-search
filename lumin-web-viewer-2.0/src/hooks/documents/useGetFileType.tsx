import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { getFileType } from 'utils/getFileService';

import { extensions } from 'constants/documentType';

export type FileType = typeof extensions[keyof typeof extensions];

export const useGetFileType = (): FileType => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  /**
   * Document is loading or not loaded yet
   */
  if (!currentDocument) {
    return null;
  }

  return getFileType(currentDocument) as FileType;
};
