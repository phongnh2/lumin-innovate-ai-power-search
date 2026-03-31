import { PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { ActionButtons } from './ActionButtons';
import LinkSettings from './LinkSettings';
import useGetInviteLinkData from '../hooks/useGetInviteLinkData';
import useHandleInviteLink from '../hooks/useHandleInviteLink';
import styles from '../InviteLink.module.scss';
import { getInviteLinkUrl } from '../utils';

const InviteLinkContent = () => {
  const { t } = useTranslation();
  const { roleIsMember, isManager } = useHandleInviteLink();
  const { inviteLink } = useGetInviteLinkData();
  const { inviteId, isExpired } = inviteLink;

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        {roleIsMember ? t('inviteLink.inviteAsMember') : t('inviteLink.inviteAsAdmin')}
        {isManager && <LinkSettings />}
      </div>
      <div className={styles.linkWrapper}>
        <PlainTooltip content={isExpired && isManager ? t('inviteLink.expiredLinkTooltip') : ''} maw="unset">
          <Text ellipsis className={isExpired ? styles.disabledLink : ''}>
            {getInviteLinkUrl(inviteId)}
          </Text>
        </PlainTooltip>
        <ActionButtons />
      </div>
    </div>
  );
};

export default InviteLinkContent;
