import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { markReadAllNotifications, updateNotificationsCache } from 'services/graphServices/notification';

import { toastUtils } from 'utils';
import error from 'utils/error';

import { NotificationTabs } from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

import styles from './NotificationHeader.module.scss';

function NotificationHeader() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tab = useSelector(selectors.getCurrentNotificationTab);
  const { general } = useSelector(selectors.getUserNotificationStatus, shallowEqual) || {};

  const isReadAll = !general.unreadCount;

  const onReadAll = async () => {
    try {
      if (isReadAll) {
        return;
      }
      await markReadAllNotifications();

      updateNotificationsCache(
        (draft: INotificationBase[]) => draft.map((item) => ({ ...item, is_read: true })),
        NotificationTabs.GENERAL
      );
      dispatch(
        actions.updateCurrentUser({
          notificationStatus: {
            general: {
              unreadCount: 0,
              hasNewNoti: false,
            },
          },
        })
      );
    } catch (e) {
      const { message } = error.extractGqlError(e) as { message: string };
      toastUtils.error({ message }).catch(() => {});
    }
  };

  return (
    <div className={styles.header}>
      {t('common.notification')}
      {tab === NotificationTabs.GENERAL && (
        <div className={styles.actionWrapper}>
          <PlainTooltip content={t('viewer.markAllAsReadNotification')} position="bottom-end">
            <IconButton
              icon="ph-checks"
              size="md"
              disabled={isReadAll}
              onClick={onReadAll}
              iconColor="var(--kiwi-colors-surface-on-surface-variant)"
              data-cy="mark_all_as_read_button"
            />
          </PlainTooltip>
        </div>
      )}
    </div>
  );
}

export default NotificationHeader;
