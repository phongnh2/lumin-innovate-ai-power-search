import { useState, useCallback } from 'react';

export const useSelectorPopoverManager = () => {
  const [openedId, setOpenedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenedId((prev) => (prev === id ? null : id));
  }, []);

  const close = useCallback(() => {
    setOpenedId(null);
  }, []);

  const isOpen = useCallback((id: string) => openedId === id, [openedId]);

  return { toggle, close, isOpen };
};
