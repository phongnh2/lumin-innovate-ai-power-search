import errorExtract from 'utils/error';

import { useUpdateRecentDocumentList } from 'features/ViewerNavigation';

import { useSaveRecentDocument } from './useSaveRecentDocument';

export const useHandleRecentDocumentList = ({ error }: { error: unknown }) => {
  const formatedError = errorExtract.extractGqlError(error);

  useSaveRecentDocument();

  useUpdateRecentDocumentList({ error: formatedError });
};
