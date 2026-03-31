import { useCallback } from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';
import TemplateModal from 'lumin-components/TemplateModal';

const RenameDocumentModal = lazyWithRetry(() => import('lumin-components/RenameDocumentModal'));
const ShareDocumentOrganizationModal = lazyWithRetry(() => import('lumin-components/ShareDocumentOrganizationModal'));
const ShareModal = lazyWithRetry(() => import('lumin-components/ShareModal'));
const InfoModal = lazyWithRetry(() => import('lumin-components/InfoModal/InfoModal'));

const usePrefetchMoreOptions = () => {
  const prefetchOptions = useCallback(() => {
    RenameDocumentModal.preload();
    ShareDocumentOrganizationModal.preload();
    ShareModal.preload();
    TemplateModal.CreateBaseOnDoc.preload();
    InfoModal.preload();
  }, []);
  return (
    { prefetchOptions }
  );
};

usePrefetchMoreOptions.propTypes = {

};

export default usePrefetchMoreOptions;
