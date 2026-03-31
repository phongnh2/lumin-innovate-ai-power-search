import { PlainTooltip, Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useGetInviteLinkData from '../hooks/useGetInviteLinkData';
import useHandleInviteLink from '../hooks/useHandleInviteLink';
import styles from '../InviteLink.module.scss';

export const ActionButtons = () => {
  const { t } = useTranslation();
  const { onClickRegenerateInviteLink, isManager, loading, copyInviteLink, isCopy } = useHandleInviteLink();
  const { inviteLink } = useGetInviteLinkData();
  const { isExpired } = inviteLink;

  if (isExpired && isManager) {
    return (
      <Button
        variant="text"
        size="lg"
        onClick={onClickRegenerateInviteLink}
        className={styles.regenerateButton}
        data-cy="regenerate_link_button"
        loading={loading}
        data-lumin-btn-name={ButtonName.REGENERATE_INVITE_LINK}
      >
        {t('inviteLink.regenerateLink')}
      </Button>
    );
  }

  return (
    <PlainTooltip content={isExpired ? t('inviteLink.disabledCopyLinkTooltip') : ''} position="bottom-end">
      <div className={styles.copyButtonWrapper}>
        <Button
          variant="text"
          size="lg"
          className={styles.hiddenButton}
          startIcon={<Icomoon type="link-lg" size="lg" />}
        >
          {t('inviteLink.copyLink')}
        </Button>
        <Button
          variant="text"
          size="lg"
          onClick={copyInviteLink}
          className={styles.copyButton}
          startIcon={<Icomoon type="link-lg" size="lg" />}
          disabled={isExpired}
          data-cy="copy_link_button"
        >
          {isCopy ? t('common.copied') : t('inviteLink.copyLink')}
        </Button>
      </div>
    </PlainTooltip>
  );
};
