import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { useEnableWebReskin, useTranslation } from 'hooks';

import * as Styled from '../ShareModal.styled';
import { ShareModalContext } from '../ShareModalContext';

const Footer = ({ onClose, openInviteSharedUser }) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const { handleSendClick, check3rdCookies, isTransfering, userTags } = useContext(ShareModalContext);
  const isDisabledButton = isTransfering || !userTags.length;

  const handleSubmit = () => {
    check3rdCookies(() => handleSendClick(openInviteSharedUser));
  };

  return (
    <Styled.FooterButtonContainer
      disabledCancel={isTransfering}
      onCancel={onClose}
      label={isEnableReskin ? t('common.share') : t('common.save')}
      loading={isTransfering}
      disabled={isDisabledButton}
      onSubmit={handleSubmit}
      isReskin={isEnableReskin}
    />
  );
};

Footer.propTypes = {
  onClose: PropTypes.func.isRequired,
  openInviteSharedUser: PropTypes.func.isRequired,
};

export default Footer;
