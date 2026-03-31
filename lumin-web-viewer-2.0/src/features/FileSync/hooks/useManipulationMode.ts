import { useFileHasChanged } from './useFileHasChanged';

export const useManipulationMode = ({ shouldListenChangedFile }: { shouldListenChangedFile: boolean }) => {
  const { fileHasChanged } = useFileHasChanged({ enabled: shouldListenChangedFile });
  return {
    fileContentChanged: fileHasChanged,
  };
};
