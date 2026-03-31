import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type UseAutoCloseDrawerProps = {
  onClose: () => void;
};

const useAutoCloseDrawer = ({ onClose }: UseAutoCloseDrawerProps) => {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);
};

export default useAutoCloseDrawer;
