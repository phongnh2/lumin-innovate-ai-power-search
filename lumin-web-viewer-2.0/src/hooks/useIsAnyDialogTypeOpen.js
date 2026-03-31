import { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import selectors from 'selectors';

export function useIsAnyDialogTypeOpen() {
  const isOpenModalData = useSelector(selectors.isOpenModalData, shallowEqual);
  const isOpenRequireUseCommentModal = useSelector((state) => selectors.isElementOpen(state, 'requireUseCommentModal'), shallowEqual);
  const isOpenDialog = useSelector(selectors.getIsDialogOpen, shallowEqual);
  const isOpenSignatureModal = useSelector((state) => selectors.isElementOpen(state, 'signatureModal'), shallowEqual);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(Boolean(isOpenModalData || isOpenRequireUseCommentModal || isOpenDialog || isOpenSignatureModal));
  }, [isOpenModalData, isOpenRequireUseCommentModal, isOpenDialog, isOpenSignatureModal]);
  return { open };
}
