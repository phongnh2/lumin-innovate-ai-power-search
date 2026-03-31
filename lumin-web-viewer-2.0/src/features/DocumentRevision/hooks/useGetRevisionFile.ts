import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { documentStorage } from 'constants/documentConstants';

import { useDocumentVersioningContext } from './useDocumentVersioningContext';
import { documentVersioningCache } from '../cache';
import { IDocumentRevision } from '../interface';

export const useGetRevisionFile = () => {
  const { revisionService } = useDocumentVersioningContext();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const getRevisionData = async (
    versionItem: IDocumentRevision
  ): Promise<ReturnType<typeof revisionService.getFileDataByVersionId>> => {
    const { _id: versionId } = versionItem;
    const cached = (await documentVersioningCache.getFile(versionId)) as File;
    if (cached) {
      return {
        file: cached,
        annotationData: null,
      };
    }

    if ([documentStorage.s3, documentStorage.google].includes(currentDocument.service)) {
      return revisionService.getFileDataByVersionId({
        versionId,
        currentDocument,
      });
    }

    return {
      file: null,
      annotationData: null,
    };
  };

  return { getRevisionData };
};
