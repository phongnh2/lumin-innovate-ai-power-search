import { useDocumentsRouteMatch } from 'hooks/useDocumentsRouteMatch';
import useHomeMatch from 'hooks/useHomeMatch';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';
import { useViewerMatch } from 'hooks/useViewerMatch';

const useIsUploadablePage = () => {
  const { isHomePage } = useHomeMatch();
  const { isTemplatesPage } = useTemplatesPageMatch();
  const isDocumentsRouteMatch = useDocumentsRouteMatch();
  const { isViewer } = useViewerMatch();

  return {
    isUploadablePage: isHomePage || isTemplatesPage || isDocumentsRouteMatch || isViewer,
  };
};

export default useIsUploadablePage;
