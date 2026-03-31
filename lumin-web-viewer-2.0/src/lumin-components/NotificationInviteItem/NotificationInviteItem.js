import produce from 'immer';
import { filter } from 'lodash';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import NotificationItemAvatar from 'lumin-components/NotificationItemAvatar';
import NotiInviteOrgItem from 'lumin-components/NotiInviteOrgItem';
import { formatTime } from 'luminComponents/NotificationItem/utils';
import { useTrackingNotificationsEvent } from 'luminComponents/NotificationItemRenderer/hooks';

import { useTranslation } from 'hooks';
import { useEnableWebReskin } from 'hooks/useEnableWebReskin';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useGetNotificationName from 'hooks/useGetNotificationName';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';
import { updateNotificationsCache } from 'services/graphServices/notification';

import logger from 'helpers/logger';

import { dateUtil, errorUtils, string } from 'utils';
import { getTrendingUrl } from 'utils/orgUrlUtils';

import { NotiType, NotificationTabs } from 'constants/notificationConstant';

import styles from '../NotificationItem/NotificationItem.module.scss';

import * as Styled from './NotificationInviteItem.styled';

const NotificationInviteItem = ({ notification }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);
  const notificationName = useGetNotificationName(notification, NotificationTabs.INVITES);
  const currentUser = useGetCurrentUser();
  const { email } = currentUser;
  const elementRef = useRef(null);
  useTrackingNotificationsEvent({ elementRef, notificationName });
  const { isEnableReskin } = useEnableWebReskin();
  const [isLoading, setIsLoading] = useState(false);

  const getInvitationId = () => {
    const { invitationId: idOfInvitation } = notification.target.targetData;
    if (idOfInvitation) {
      return idOfInvitation;
    }
    const { invitationList } = notification.target.targetData;
    return invitationList.find((invitation) => invitation.email === email)._id;
  };

  const handleAcceptInvitation = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const { orgUrl, orgId } = notification.entity.entityData;
    const invitationId = getInvitationId();
    try {
      await organizationServices.acceptOrganizationInvitation({ orgId });
      updateNotificationsCache(
        (draft) => filter(draft, (item) => item._id !== notification._id),
        NotificationTabs.INVITES
      );
      // track event
      orgTracking.trackUserAcceptOrganizationInvitation({
        targetOrganizationId: orgId,
        organizationUserInvitationId: invitationId,
      });
      dispatch(actions.fetchOrganizations());

      window.open(getTrendingUrl({ orgUrl }), '_blank');
    } catch (err) {
      logger.logError({ error: err });
      errorUtils.handleScimBlockedError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvitation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const renderContent = (_notification) => {
    const noticationNameShorten = produce(_notification, (draftState) => {
      draftState.actor.name = string.getShortenStringNotification(_notification.actor.name);
      if (_notification.entity) {
        draftState.entity.name = string.getShortenStringNotification(_notification.entity.name);
      }
      if (_notification.target) {
        draftState.target.targetName = string.getShortenStringNotification(_notification.target.targetName);
      }
    });

    return _notification.notificationType === NotiType.ORGANIZATION ? (
      <NotiInviteOrgItem notification={noticationNameShorten} open={isOpen} setOpen={setOpen} />
    ) : null;
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container} data-cy="notification_invite_item">
        <div className={styles.avatarWrapper}>
          <NotificationItemAvatar notification={notification} />
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.content}>{renderContent(notification)}</div>
          <div className={styles.bottomWrapper}>
            <div className={styles.timeAndProduct}>
              <div className={styles.time}>
                <span>{formatTime(notification)}</span>
              </div>
            </div>
            <div className={styles.actionsWrapper}>
              <Button variant="elevated" size="sm" onClick={handleRejectInvitation} className={styles.rejectButton} data-cy="notification_invite_reject_button">
                {t('common.reject')}
              </Button>
              <Button size="sm" onClick={handleAcceptInvitation} className={styles.acceptButton} data-cy="notification_invite_accept_button">
                {t('common.accept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Styled.InviteItemContainer ref={elementRef}>
      <Styled.HeaderItem>
        <Styled.DateTime>
          <span>{dateUtil.formatFullDate(new Date(notification.createdAt))}</span>
        </Styled.DateTime>
      </Styled.HeaderItem>
      <Styled.Wrapper>
        <Styled.LeftContent>
          <NotificationItemAvatar notification={notification} />
        </Styled.LeftContent>
        <Styled.RightItem>
          <Styled.RightContent>{renderContent(notification)}</Styled.RightContent>
          <Styled.ButtonContainer>
            <Styled.NotificationButton
              color={ButtonColor.TERTIARY}
              size={ButtonSize.XS}
              onClick={handleRejectInvitation}
            >
              {t('common.reject')}
            </Styled.NotificationButton>
            <Styled.NotificationButton size={ButtonSize.XS} onClick={handleAcceptInvitation}>
              {t('common.accept')}
            </Styled.NotificationButton>
          </Styled.ButtonContainer>
        </Styled.RightItem>
      </Styled.Wrapper>
    </Styled.InviteItemContainer>
  );
};

NotificationInviteItem.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default NotificationInviteItem;
