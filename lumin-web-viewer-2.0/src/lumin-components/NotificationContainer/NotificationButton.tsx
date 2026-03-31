import {
  PlainTooltip,
  IconButton as KiwiIconButton,
  Icomoon as KiwiIcomoon,
  Popover,
  PopoverTarget,
  PopoverDropdown,
} from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import LuminNotificationButton from '@new-ui/components/LuminTitleBar/components/TitleBarRightSection/components/LuminNotificationButton';

import selectors from 'selectors';

import { useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { eventTracking } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import Notification from 'features/Notification';
import styles from 'features/Notification/NotificationContent.module.scss';

import UserEventConstants from 'constants/eventConstants';

import { INotificationBase } from 'interfaces/notification/notification.interface';

import './NotificationContainer.scss';

interface NotificationButtonProps {
  error: boolean;
  loading: boolean;
  notifications: INotificationBase[];
  fetchMoreData: () => void;
  hasNextPage: boolean;
  closePopper: () => void;
}

function NotificationButton({
  error = false,
  loading = false,
  notifications = [] as INotificationBase[],
  fetchMoreData = () => {},
  hasNextPage = false,
}: NotificationButtonProps) {
  const [notificationShow, setNotificationShow] = useState(false);
  const { t } = useTranslation();
  const isOffline = useSelector(selectors.isOffline);
  const hasNewNotifications = useSelector(selectors.hasNewNotifications);
  const { isViewer } = useViewerMatch();

  const onOpenNotification = () => {
    setNotificationShow((prev) => !prev);
    eventTracking(UserEventConstants.EventType.HEADER_BUTTON, {
      elementName: ButtonName.NOTIFICATION,
      elementPurpose: ButtonPurpose[ButtonName.NOTIFICATION],
    }).catch(() => {});
  };

  const closePopper = () => {
    setNotificationShow(false);
  };

  return (
    <Popover
      position="bottom-end"
      opened={notificationShow}
      onDismiss={closePopper}
      trapFocus
      returnFocus
      onClose={closePopper}
    >
      <PopoverTarget>
        <div>
          {isViewer ? (
            <LuminNotificationButton
              hasNewNotifications={hasNewNotifications}
              toggleNotification={onOpenNotification}
              notificationShow={notificationShow}
              data-cy="notification_button"
            />
          ) : (
            <PlainTooltip disableInteractive={notificationShow} content={t('common.notifications')} position="bottom">
              <KiwiIconButton
                activated={notificationShow}
                disabled={isOffline}
                onClick={onOpenNotification}
                size="lg"
                aria-haspopup="true"
                icon={<KiwiIcomoon type="notification-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />}
                data-cy="notification_button"
              >
                {hasNewNotifications && <span className="Notification__dotReskin" />}
              </KiwiIconButton>
            </PlainTooltip>
          )}
        </div>
      </PopoverTarget>
      <PopoverDropdown paddingVariant="none" className={styles.popoverDropdown}>
        <Notification
          error={error}
          loading={loading}
          notifications={notifications}
          fetchMore={fetchMoreData}
          closePopper={closePopper}
          hasNextPage={hasNextPage}
        />
      </PopoverDropdown>
    </Popover>
  );
}

export default NotificationButton;
