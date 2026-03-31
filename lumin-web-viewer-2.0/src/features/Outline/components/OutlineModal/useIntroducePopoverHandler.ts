import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { LocalStorageKey } from 'constants/localStorageKey';

/**
 * delay show popover for smoother experience
 */
const OPEN_DELAY = 500;

export const useIntroducePopoverHandler = () => {
  const [open, setOpen] = useState(false);
  const debouncedOpen = useDebouncedCallback(() => {
    setOpen(true);
    localStorage.setItem(LocalStorageKey.INTRODUCE_OUTLINE_POPOVER, 'true');
  }, OPEN_DELAY);

  const canShow = () => localStorage.getItem(LocalStorageKey.INTRODUCE_OUTLINE_POPOVER) !== 'true';

  const close = () => setOpen(false);

  useEffect(() => {
    if (canShow()) {
      debouncedOpen();
    }
    return () => {
      debouncedOpen.cancel();
    };
  }, [debouncedOpen]);

  return {
    open,
    close,
  };
};
