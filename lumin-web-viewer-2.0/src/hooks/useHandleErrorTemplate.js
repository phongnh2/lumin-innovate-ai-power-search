import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

import useForceReloadModal from './useForceReloadModal';

const useHandleErrorTemplate = ({ error, onConfirm: onConfirmProp }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const onConfirm = () => {
    if (onConfirmProp) {
      onConfirmProp();
    }
    navigate(location.pathname);
  };
  const { openModal } = useForceReloadModal({ onConfirm });
  useEffect(() => {
    if (error) {
      openModal();
    }
  }, [error]);
};

export default useHandleErrorTemplate;
