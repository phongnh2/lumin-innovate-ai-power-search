import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';

import { WarningBannerType } from 'constants/banner';
import { HELP_CENTER_URL } from 'constants/customConstant';

import styles from '../WarningBanner.module.scss';

interface WorkspaceAnnouncementProps {
  renderClose?: (props: {
    onClick: () => void;
    customColor?: string;
    isReskin?: boolean;
    banner: string;
  }) => React.ReactNode;
  onClose: () => void;
}

const WorkspaceAnnouncement: React.FC<WorkspaceAnnouncementProps> = ({ renderClose, onClose }) => {
  const { trackBannerDismiss } = useTrackingBannerEvent({
    bannerName: BannerName.SIGN_WORKSPACE_ANNOUNCEMENT,
    bannerPurpose: BannerPurpose[BannerName.SIGN_WORKSPACE_ANNOUNCEMENT],
    trackingProps: {
      enableCaching: false,
    },
  });

  const handleDismiss = (): void => {
    trackBannerDismiss();
    onClose();
  };

  return (
    <div className={classNames(styles.container, styles.sign)}>
      <div className={styles.contentWrapper}>
        <Text
          className={classNames(styles.textContainer, styles.textWithLinkButton)}
          type="title"
          size="sm"
          color="var(--color-lumin-sign-on-primary-container)"
        >
          <Trans
            i18nKey="banner.workspaceAnnouncement.mainTitle"
            components={{
              a: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <a
                  className={classNames(styles.linkButton, styles.sign)}
                  aria-label="Learn more"
                  href={`${HELP_CENTER_URL}/workspaces-in-lumin-sign`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </Text>
      </div>
      {renderClose({
        onClick: handleDismiss,
        isReskin: true,
        banner: WarningBannerType.WORKSPACE_ANNOUNCEMENT.value,
      })}
    </div>
  );
};

export default WorkspaceAnnouncement;
