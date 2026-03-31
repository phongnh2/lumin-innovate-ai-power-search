import PropTypes from 'prop-types';
import React from 'react';

import NoInviteImg from 'assets/images/no-invites-notification.svg';
import NoInviteImgReskinDark from 'assets/reskin/images/find-something-dark.png';
import NoInviteImgReskin from 'assets/reskin/images/find-something.png';

import { useEnableWebReskin, useThemeMode, useTranslation } from 'hooks';

import { NotificationTabs } from 'constants/notificationConstant';

import * as Styled from './EmptyInviteNotification.styled';

import styles from './EmptyInviteNotification.module.scss';

const TEXT_TAB_MAPPING = {
  [NotificationTabs.INVITES]: 'notification.emptyNotification.invites',
  [NotificationTabs.REQUESTS]: 'notification.emptyNotification.requests',
};

function EmptyInviteNotification({ tab }) {
  const notificationText = TEXT_TAB_MAPPING[tab];
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const themeMode = useThemeMode();

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.imgWrapper}>
          <img
            className={styles.img}
            src={themeMode === 'dark' ? NoInviteImgReskinDark : NoInviteImgReskin}
            alt="no-invitations"
          />
        </div>
        <div className={styles.text}>{t(notificationText)}</div>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.ImgWrapper>
        <Styled.ImgContainer>
          <Styled.Img src={NoInviteImg} alt="no-invitations" />
        </Styled.ImgContainer>
      </Styled.ImgWrapper>
      <Styled.Text>{t(notificationText)}</Styled.Text>
    </Styled.Container>
  );
}

EmptyInviteNotification.propTypes = {
  tab: PropTypes.string,
};

EmptyInviteNotification.defaultProps = {
  tab: NotificationTabs.INVITES,
};

export default EmptyInviteNotification;
