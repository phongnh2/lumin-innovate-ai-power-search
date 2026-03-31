import { useQuery } from '@tanstack/react-query';
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { documentStorage } from 'constants/documentConstants';

import { IDocumentRevision } from '../interface';
import revisionServiceFactory from '../utils/serviceFactory';

export function useGetRevisionList({
  canUseEnhancedFeatures,
  currentVersionIdRef,
  setActiveVersion,
  revisionService,
}: {
  canUseEnhancedFeatures: boolean;
  currentVersionIdRef?: MutableRefObject<string>;
  setActiveVersion: Dispatch<SetStateAction<string>>;
  revisionService: ReturnType<typeof revisionServiceFactory.from>;
}) {
  // TODO - it will be assigned with currentDocument.limitRevision after BE'feature done.
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const limitRevisionFetch = 5;

  const [documentRevisions, setDocumentRevisions] = useState<IDocumentRevision[]>();

  const getRevisions = async (): Promise<IDocumentRevision[]> => {
    try {
      const fileId = revisionService.getFileId(currentDocument);
      return await revisionService.getList({ fileId, limit: limitRevisionFetch });
    } catch (error: unknown) {
      revisionService.loggerError({
        error,
      });
      return null;
    }
  };

  const {
    data: fetchedVersions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['documentRevisions'],
    queryFn: getRevisions,
    enabled: !!revisionService,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!fetchedVersions) {
      return;
    }

    const versions =
      currentDocument.service === documentStorage.google && !canUseEnhancedFeatures
        ? fetchedVersions.slice(0, limitRevisionFetch)
        : fetchedVersions;

    setActiveVersion(versions[0]?._id);
    currentVersionIdRef.current = versions[0]?._id;
    setDocumentRevisions(versions);
  }, [fetchedVersions, canUseEnhancedFeatures, currentDocument?.service]);

  return {
    isFetchingList: isLoading || isRefetching,
    documentRevisions,
    refetchVersions: refetch,
  };
}
