import { useCallback, useState } from 'react';

export const usePopoverButtonState = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [shouldKeepOpen, setShouldKeepOpen] = useState(false);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    if (shouldKeepOpen) {
      return;
    }
    setAnchorEl(null);
  }, [shouldKeepOpen]);

  return {
    anchorEl,
    open,
    handleClick,
    handleClose,
    setShouldKeepOpen,
  };
};
