import * as dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React, { Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import EmptyNotification from 'lumin-components/EmptyNotification';
import NotificationItemRenderer from 'lumin-components/NotificationItemRenderer';
import ErrorBoundary from 'luminComponents/ErrorBoundary';
import Loading from 'luminComponents/Loading';

import { useInfinityScroll, useTranslation } from 'hooks';

import {
  NotiComment,
  NotiContract,
  NotiDocument,
  NotiFolder,
  NotiOrg,
  NotiOrgTeam,
  NotiTeam,
  NotiType,
  NotificationTabs,
} from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

import NotificationListSkeleton from '../NotificationListSkeleton';

import styles from './NotificationList.module.scss';

const { Organization: NotiOrgFolder } = NotiFolder.Notification;

const NOTIFICATION_TYPE = [
  ...Object.values(NotiDocument),
  ...Object.values(NotiComment),
  ...Object.values(NotiOrg),
  ...Object.values(NotiTeam),
  ...Object.values(NotiOrgTeam),
  ...Object.values(NotiOrgFolder),
  ...Object.values(NotiContract),
];

interface NotificationListProps {
  error: boolean;
  notifications: INotificationBase[];
  loading: boolean;
  fetchMore: () => void;
  hasNextPage: boolean;
  closePopper: () => void;
}

function NotificationList({
  error,
  notifications,
  loading,
  fetchMore,
  hasNextPage,
  closePopper,
}: NotificationListProps) {
  const { t } = useTranslation();
  const tab = useSelector(selectors.getCurrentNotificationTab);
  const { setLastElement } = useInfinityScroll({
    executer: fetchMore,
  });

  const memoNotifications = useMemo(() => {
    const notificationsFiltered = cloneDeep(notifications ).filter(({ notificationType, actionType }) => {
      const isValidNotificationType = NOTIFICATION_TYPE.includes(actionType);
      const isPaymentNotification = notificationType === NotiType.PAYMENT;
      return !isPaymentNotification && isValidNotificationType;
    });
    let hasToday = false;
    let hasEarlier = false;
    return notificationsFiltered.map((item) => {
      const isToday = dayjs().isSame(item.createdAt, 'day');
      if (isToday && !hasToday) {
        item.todayLabel = true;
        hasToday = true;
      }

      if (!isToday && !hasEarlier) {
        item.earlierLabel = true;
        hasEarlier = true;
      }

      return item;
    });
  }, [notifications]);

  const isGeneralTab = useMemo(() => tab === NotificationTabs.GENERAL, [tab]);

  const renderLoading = () => (
    <div style={{ padding: '16px 0 32px' }}>
      <Loading normal reskinSize="xs" useReskinCircularProgress />
    </div>
  );

  const renderNotificationByTab = (noti: INotificationBase) => {
    switch (tab) {
      case NotificationTabs.GENERAL:
        return <NotificationItemRenderer.General notification={noti} closePopper={closePopper} />;
      case NotificationTabs.INVITES:
        return <NotificationItemRenderer.Invite notification={noti} />;
      default:
        return <NotificationItemRenderer.Request notification={noti} closePopper={closePopper} />;
    }
  };
  const renderNotiItem = (noti: INotificationBase, index: number) => {
    /* Another notification items based on tab will be rendered here using condition */
    const content = (
      <ErrorBoundary shouldRenderEmpty key={noti._id}>
        {renderNotificationByTab(noti)}
      </ErrorBoundary>
    );

    const isAttachRef = !loading && hasNextPage && index === memoNotifications.length - 1;
    const extraProps = isAttachRef ? { ref: setLastElement } : {};

    return (
      <Fragment key={noti._id}>
        {noti.earlierLabel && <div className={styles.label}>{t('notification.earlier')}</div>}
        {noti.todayLabel && <div className={styles.label}>{t('common.today')}</div>}
        <div className={styles.itemWrapper} {...extraProps}>
          {content}
        </div>
      </Fragment>
    );
  };

  if (error || (loading && !memoNotifications.length)) {
    return (
      <div className={styles.listContainer}>
        <NotificationListSkeleton isGeneral={isGeneralTab} />
      </div>
    );
  }

  const isReachedEnd = Boolean(!loading && !hasNextPage && memoNotifications.length);

  return (
    <ScrollArea>
      {memoNotifications.map(renderNotiItem)}
      {loading && renderLoading()}
      {isReachedEnd && isGeneralTab && <div className={styles.reachedEnd}>{t('notification.youReachedTheEnd')}</div>}
      {!loading && !memoNotifications.length && <EmptyNotification />}
    </ScrollArea>
  );
}

export default NotificationList;
