import { useMutation, useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash';

import { queryClient } from 'utils/queryClient';

import { LocalStorageKey } from 'constants/localStorageKey';

import { RecentDocumentItem } from '../interfaces';

const RECENT_DOCUMENTS_QUERY_KEY = 'recentDocumentList';

const getRecentDocumentList = () =>
  JSON.parse(localStorage.getItem(LocalStorageKey.RECENT_DOCUMENT_LIST)) as RecentDocumentItem[];

export const MAX_RECENT_DOCUMENTS = 20;

const convertImageToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return url;
  }
};

/**
 * Use async to simulate the API call because we will replace this by getRecentDocuments API from Web team
 */
const setRecentDocument = async (documentInfo: RecentDocumentItem) => {
  const recentDocumentList = getRecentDocumentList() || [];

  const processedDocumentInfo = {
    ...documentInfo,
    thumbnailUrl:
      documentInfo.thumbnailUrl && !documentInfo.thumbnailUrl.startsWith('data:')
        ? await convertImageToBase64(documentInfo.thumbnailUrl)
        : documentInfo.thumbnailUrl,
  };

  const newRecentDocumentList = uniqBy([processedDocumentInfo, ...recentDocumentList], '_id').slice(
    0,
    MAX_RECENT_DOCUMENTS
  );

  localStorage.setItem(LocalStorageKey.RECENT_DOCUMENT_LIST, JSON.stringify(newRecentDocumentList));
  return Promise.resolve();
};

const removeRecentDocument = async (documentIds: string[]) => {
  const recentDocumentList = getRecentDocumentList() || [];
  const newRecentDocumentList = recentDocumentList.filter((item) => !documentIds.includes(item._id));
  localStorage.setItem(LocalStorageKey.RECENT_DOCUMENT_LIST, JSON.stringify(newRecentDocumentList));
  return Promise.resolve();
};

export const useGetRecentDocumentList = () => {
  const queryResults = useQuery({
    queryKey: [RECENT_DOCUMENTS_QUERY_KEY],
    queryFn: () => getRecentDocumentList(),
    refetchOnMount: true,
  });

  return {
    ...queryResults,
  };
};

export const useSetRecentDocument = () => {
  const mutationFn = async (documentInfo: RecentDocumentItem): Promise<void> => {
    await setRecentDocument(documentInfo);
  };

  const mutationResults = useMutation({
    mutationFn,
  });

  return {
    ...mutationResults,
  };
};

export const useRemoveRecentDocument = () => {
  const mutationFn = async (documentIds: string[]): Promise<void> => {
    await removeRecentDocument(documentIds);
    queryClient.setQueryData([RECENT_DOCUMENTS_QUERY_KEY], (oldData: RecentDocumentItem[]) =>
      oldData?.filter((item) => !documentIds.includes(item._id))
    );
  };

  const mutationResults = useMutation({
    mutationFn,
  });

  return {
    ...mutationResults,
  };
};
