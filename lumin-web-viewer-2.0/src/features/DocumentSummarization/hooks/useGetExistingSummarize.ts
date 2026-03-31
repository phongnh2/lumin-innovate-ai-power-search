import { useQueryClient } from '@tanstack/react-query';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { IDocumentSummarized } from '../interfaces';

export function useGetExistingSummarize () {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const queryClient = useQueryClient();

  const existingSummarize: IDocumentSummarized = queryClient.getQueryData(['DOCSUM_GET', currentDocument._id]);

  return { existingSummarize };
}