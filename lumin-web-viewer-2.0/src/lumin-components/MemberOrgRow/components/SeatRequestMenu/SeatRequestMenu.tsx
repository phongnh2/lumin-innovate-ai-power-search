import { Menu, MenuItem, Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import { useTranslation } from 'hooks';

import event from 'utils/Factory/EventCollection/EventCollection';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from './SeatRequestMenu.module.scss';

interface SeatRequestMenuProps {
  opened: boolean;
  availableSignSeats: number;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  isProcessing: boolean;
}

const SeatRequestMenu: React.FC<SeatRequestMenuProps> = ({
  opened,
  availableSignSeats,
  setOpened,
  onAccept,
  onReject,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const { bodyScrollRef } = useContext(AppLayoutContext);

  const handleAccept = () => {
    event
      .record({
        name: AWS_EVENTS.SIGN_REQUEST_UPGRADE.ACCEPT,
        attributes: { seatAvailable: availableSignSeats > 0 },
        forwardFromPinpoint: false,
      })
      .catch(() => {});

    onAccept().catch(() => {});
  };

  const handleReject = () => {
    event
      .record({
        name: AWS_EVENTS.SIGN_REQUEST_UPGRADE.REJECT,
        attributes: { seatAvailable: availableSignSeats > 0 },
        forwardFromPinpoint: false,
      })
      .catch(() => {});

    onReject().catch(() => {});
  };

  return (
    <div className={styles.wrapper}>
      <Menu
        opened={opened}
        ComponentTarget={
          <Button
            className={styles.seatRequestButton}
            variant="outlined"
            loading={isProcessing}
            endIcon={<Icomoon type="chevron-down-md" size="md" />}
          >
            {t('memberPage.luminSignSeat.seatRequest')}
          </Button>
        }
        onChange={setOpened}
        position="bottom-end"
        closeOnItemClick
        closeOnScroll={{ elementRef: bodyScrollRef }}
      >
        <div className={styles.menu}>
          <MenuItem
            className={styles.menuItem}
            data-cy="accept_seat_request"
            leftIconProps={{
              type: 'check-lg',
              size: 'lg',
              color: 'var(--kiwi-colors-semantic-success)',
            }}
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {t('memberPage.luminSignSeat.accept')}
          </MenuItem>

          <MenuItem
            className={styles.menuItem}
            data-cy="reject_seat_request"
            leftIconProps={{
              type: 'x-lg',
              size: 'lg',
              color: 'var(--kiwi-colors-semantic-error)',
            }}
            onClick={handleReject}
            disabled={isProcessing}
          >
            {t('memberPage.luminSignSeat.reject')}
          </MenuItem>
        </div>
      </Menu>
    </div>
  );
};

export default React.memo(SeatRequestMenu);
