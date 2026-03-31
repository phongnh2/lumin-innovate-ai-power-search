/* eslint-disable @typescript-eslint/no-floating-promises */
import { Badge, PlainTooltip, Switch } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { useTranslation, useRestrictedUser } from 'hooks';

import { createOrganizationInviteLink } from 'services/graphServices/inviteLinkServices';

import logger from 'helpers/logger';

import { errorUtils, hotjarUtils, toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';

import useGetInviteLinkData from '../hooks/useGetInviteLinkData';
import styles from '../InviteLink.module.scss';
import { setInviteLink } from '../reducer/InviteLink.reducer';

const InviteLinkSwitch = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { isInviteScopeInternalOnly } = useRestrictedUser();
  const { inviteLink, selectedOrg: currentOrganization } = useGetInviteLinkData();

  const onEnableInviteLink = async () => {
    setIsLoading(true);
    hotjarUtils.trackEvent(HOTJAR_EVENT.ENABLE_INVITE_LINK);
    try {
      const inviteLinkData = await createOrganizationInviteLink({
        orgId: currentOrganization._id,
      });
      const { _id, isExpired, role, orgId, isExpiringSoon, expiresAt, inviteId } = inviteLinkData;
      dispatch(
        setInviteLink({
          _id,
          inviteId,
          isExpired,
          role,
          orgId,
          isExpiringSoon,
          expiresAt,
        })
      );
      toastUtils.success({ message: t('inviteLink.createLinkSuccess') });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.INVITE_LINK,
        message: 'Invite link generation failed',
        error: error as Error,
      });
      errorUtils.handleScimBlockedError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.switchWrapper}>
      <div className={styles.titleWrapper}>
        <div className={styles.newBadgeWrapper}>
          <p> {t('inviteLink.title')} </p>
          <Badge size="sm" className={styles.newBadge}>
            {t('common.new')}
          </Badge>
        </div>
        <p className={styles.description}> {t('inviteLink.description')}</p>
      </div>
      <PlainTooltip content={isInviteScopeInternalOnly ? ERROR_MESSAGE_RESTRICTED_ACTION : ''} position="bottom-end">
        <div>
          <Switch
            data-cy="invite_link_switch"
            checked={Boolean(inviteLink)}
            onChange={onEnableInviteLink}
            disabled={isLoading || isInviteScopeInternalOnly}
            data-lumin-btn-name={ButtonName.ENABLE_INVITE_LINK}
          />
        </div>
      </PlainTooltip>
    </div>
  );
};

export default InviteLinkSwitch;
