import { useMemo, useEffect } from 'react';

import { useNetworkStatus } from 'hooks';

import indexedDBService from 'services/indexedDBService';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

type UseCloudDocSyncProps = {
  documents: IDocumentBase[];
  loading: boolean;
};

const useCloudDocSync = ({ documents, loading }: UseCloudDocSyncProps) => {
  const { isOffline } = useNetworkStatus();

  const filteredDocs = useMemo(() => documents.filter((doc) => doc.service !== STORAGE_TYPE.SYSTEM), [documents]);

  useEffect(() => {
    if (!loading && filteredDocs.length && !isOffline) {
      indexedDBService.setCloudDoclist(filteredDocs).finally(() => {});
    }
  }, [loading, filteredDocs, isOffline]);
};

export default useCloudDocSync;
