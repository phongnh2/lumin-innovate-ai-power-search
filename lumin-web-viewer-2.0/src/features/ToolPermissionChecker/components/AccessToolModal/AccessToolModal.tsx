import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '@new-ui/general-components/Modal';

import selectors from 'selectors';

import ToolButtonPopper from 'luminComponents/ToolButtonPopper';

import { useCleanup } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import validator from 'utils/validator';

import {
  accessToolModalActions,
  accessToolModalSelectors,
} from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

const AccessToolModal = () => {
  const openedModal = useSelector(accessToolModalSelectors.openedModal);
  const { toolName, featureName, eventName } = useSelector(accessToolModalSelectors.targetTool);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const dispatch = useDispatch();
  const validateType = validator.validateFeature({
    currentUser,
    currentDocument,
    toolName,
    featureName,
  });

  const closeModal = () => {
    dispatch(accessToolModalActions.closeModal());
  };

  useCleanup(closeModal, []);

  return (
    <Modal open={openedModal} onClose={closeModal}>
      <ToolButtonPopper
        validateType={validateType}
        renderContentOnly
        openPopper
        toolName={toolName}
        featureName={featureName}
        eventName={eventName}
      />
    </Modal>
  );
};

export default AccessToolModal;
