import { useState } from 'react';

import { useGetPromoteChromeExtensionFlag } from './useGetPromoteChromeExtensionFlag';
import { useGetPromoteChromeExtensionModalFlag } from './useGetPromoteChromeExtensionModalFlag';

const useOpenPromoteChromeExtensionModal = () => {
  const [open, setOpen] = useState(true);
  const { isPromoteChromeExtension } = useGetPromoteChromeExtensionFlag();
  const { isShowPromoteChromeExtensionModal } = useGetPromoteChromeExtensionModalFlag();

  const onClose = () => setOpen(false);

  return {
    open: open && isShowPromoteChromeExtensionModal && isPromoteChromeExtension,
    onClose,
  };
};
export { useOpenPromoteChromeExtensionModal };
