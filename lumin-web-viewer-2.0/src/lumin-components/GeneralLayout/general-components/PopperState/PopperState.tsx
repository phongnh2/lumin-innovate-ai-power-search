import React, { useCallback, useState } from 'react';

interface PopperStateProps {
  children: (props: {
    isOpen: boolean;
    anchorEl: HTMLElement | null;
    openPopper: (event: React.MouseEvent<HTMLElement>) => void;
    closePopper: () => void;
  }) => React.ReactElement;
}

const PopperState = (props: PopperStateProps) => {
  const { children } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openPopper = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);

  const closePopper = useCallback(() => setAnchorEl(null), []);

  return children({
    isOpen: Boolean(anchorEl),
    anchorEl,
    openPopper,
    closePopper,
  });
};

export default PopperState;
