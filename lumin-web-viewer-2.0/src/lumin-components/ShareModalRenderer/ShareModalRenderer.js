import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { usePrevious } from 'hooks';

import { DiscardModal } from 'features/CNC/constants/customConstant';

const SHARING_SUB_MODAL = {
  SHARE_SETTING: 'share_setting',
  BULK_UPDATE: 'bulk_update',
  FULL_REQUEST_ACCESS: 'full_request_access',
  INVITE_SHARED_USER: 'invite_shared_user',
  SHARE_IN_SLACK: 'share_in_slack',
};

function ShareModalRenderer({
  children,
  renderShareSetting,
  renderBulkUpdate,
  renderFullRequestAccess,
  renderInviteSharedUser,
  renderShareInSlack,
  setDiscardModalType,
}) {
  const [modal, setModal] = useState(null);
  const closeSubModal = () => setModal(null);

  const previousModalValue = usePrevious(modal);

  const openModal = (type) => () => {
    setModal(type);
    if (type === SHARING_SUB_MODAL.INVITE_SHARED_USER) {
      setDiscardModalType(DiscardModal.INVITATION);
      return;
    }

    setDiscardModalType(DiscardModal.UNSAVED_CHANGES);
  };

  return (
    <>
      {!modal &&
        children({
          openShareSetting: openModal(SHARING_SUB_MODAL.SHARE_SETTING),
          openBulkUpdate: openModal(SHARING_SUB_MODAL.BULK_UPDATE),
          openFullRequestList: openModal(SHARING_SUB_MODAL.FULL_REQUEST_ACCESS),
          openInviteSharedUser: openModal(SHARING_SUB_MODAL.INVITE_SHARED_USER),
          shouldAutoFoucusOnInput: !previousModalValue,
          openShareInSlack: openModal(SHARING_SUB_MODAL.SHARE_IN_SLACK),
        })}

      {modal === SHARING_SUB_MODAL.SHARE_SETTING && renderShareSetting({ onClose: closeSubModal })}
      {modal === SHARING_SUB_MODAL.BULK_UPDATE && renderBulkUpdate({ onClose: closeSubModal })}
      {modal === SHARING_SUB_MODAL.FULL_REQUEST_ACCESS && renderFullRequestAccess({ onClose: closeSubModal })}
      {modal === SHARING_SUB_MODAL.INVITE_SHARED_USER && renderInviteSharedUser()}
      {modal === SHARING_SUB_MODAL.SHARE_IN_SLACK && renderShareInSlack({ onClose: closeSubModal })}
    </>
  );
}
ShareModalRenderer.propTypes = {
  children: PropTypes.func.isRequired,
  renderShareSetting: PropTypes.func.isRequired,
  renderBulkUpdate: PropTypes.func.isRequired,
  renderFullRequestAccess: PropTypes.func.isRequired,
  renderInviteSharedUser: PropTypes.func.isRequired,
  renderShareInSlack: PropTypes.func,
  setDiscardModalType: PropTypes.func,
};

ShareModalRenderer.defaultProps = {
  setDiscardModalType: () => {},
  renderShareInSlack: () => {},
};

export default ShareModalRenderer;
