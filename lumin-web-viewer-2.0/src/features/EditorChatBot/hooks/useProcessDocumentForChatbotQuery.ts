import { useQuery } from '@tanstack/react-query';

import { processDocumentForChatbot } from '../apis';

export const useProcessDocumentForChatbotQuery = (input: { documentId: string; requestNewPutObjectUrl?: boolean }) =>
  useQuery({
    queryKey: ['processDocumentForChatbot'],
    queryFn: ({ signal }) => processDocumentForChatbot(input, { signal }),
    enabled: false,
    staleTime: 1000 * 60 * 60 * 24,
  });
