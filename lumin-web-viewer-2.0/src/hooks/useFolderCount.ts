import { useQueryClient } from '@tanstack/react-query';

export function useFolderCount(payload: { refId: string; targetType: string }) {
  const queryClient = useQueryClient();

  const queryKey = ['folderCount', payload];

  const folderCount = queryClient.getQueryData<number>(queryKey) ?? 0;

  const incrementFolderCount = () => {
    queryClient.setQueryData<number>(queryKey, (prev = 0) => prev + 1);
  };

  const updateFolderCount = (count: number) => {
    queryClient.setQueryData<number>(queryKey, count);
  };

  return {
    folderCount,
    incrementFolderCount,
    updateFolderCount,
    queryKey,
  };
}
