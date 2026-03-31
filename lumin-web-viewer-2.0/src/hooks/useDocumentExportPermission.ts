import selectors from 'selectors';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import { useIsSystemFile } from './useIsSystemFile';
import { useShallowSelector } from './useShallowSelector';

export const useDocumentExportPermission = () => {
  const { canExport, canPrint } = useShallowSelector(selectors.getDocumentCapabilities);
  const { isSystemFile } = useIsSystemFile();
  const { isTempEditMode } = useIsTempEditMode();
  const { isTemplateViewer } = useTemplateViewerMatch();
  const isDisabledDownload = !canExport && !isSystemFile && !isTempEditMode && !isTemplateViewer;
  const isDisabledPrint = !canPrint && !isSystemFile && !isTempEditMode && !isTemplateViewer;
  return {
    isDisabledDownload,
    isDisabledPrint,
  };
};
