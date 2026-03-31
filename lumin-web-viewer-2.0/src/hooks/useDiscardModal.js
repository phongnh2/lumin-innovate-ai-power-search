import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import useEnableWebReskin from 'hooks/useEnableWebReskin';
import { useTranslation } from 'hooks/useTranslation';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import { DiscardModal } from 'features/CNC/constants/customConstant';
import { getDiscardModalContent } from 'features/CNC/helpers/getDiscardModalContent';
import { useFeedbackContext } from 'features/Feedback/hooks';

import { UrlSearchParam } from 'constants/UrlSearchParam';

const useDiscardModal = ({ onConfirm }) => {
  const navigate = useNavigate();
  const searchParams = useUrlSearchParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [discardModalType, setDiscardModalType] = useState(DiscardModal.UNSAVED_CHANGES);
  const shouldOpen = useRef(false);
  const shouldOpenFeedback = useRef(false);
  const { openFeedbackModal } = useFeedbackContext();

  const { isEnableReskin } = useEnableWebReskin();

  const setShowDiscardModal = (value) => {
    shouldOpen.current = value;
  };

  const setShowFeedbackModal = (value) => {
    shouldOpenFeedback.current = value;
  };

  const handleOnConfirm = () => {
    if (shouldOpenFeedback.current) {
      openFeedbackModal();
      return;
    }
    onConfirm();
  };

  const onClose = () => {
    searchParams.delete(UrlSearchParam.OPEN_MODAL_FROM);
    navigate(
      {
        search: searchParams.toString(),
      },
      { replace: true }
    );
    if (!shouldOpen.current) {
      handleOnConfirm();
      return;
    }

    const data = getDiscardModalContent({ type: discardModalType, isEnableReskin, t });
    const settings = {
      confirmButtonTitle: t('common.discard'),
      isFullWidthButton: !isEnableReskin,
      onCancel: () => {},
      onConfirm: handleOnConfirm,
      useReskinModal: true,
      ...data,
    };
    dispatch(actions.openModal(settings));
  };

  return {
    onClose,
    setShowDiscardModal,
    setDiscardModalType,
    setShowFeedbackModal,
  };
};

export default useDiscardModal;
