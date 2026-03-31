import { useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import useGetReactivateModalFlag from 'hooks/growthBook/featureflags/useGetReactivateModalFlag';

const useOpenReactivateModal = () => {
  const [open, setOpen] = useState(true);
  const isViewerModalOpen = useSelector(selectors.isModalOpen);
  const { canShowModal } = useGetReactivateModalFlag();

  const onClose = () => setOpen(false);

  return { open: open && canShowModal && !isViewerModalOpen, onClose };
};

export { useOpenReactivateModal };
