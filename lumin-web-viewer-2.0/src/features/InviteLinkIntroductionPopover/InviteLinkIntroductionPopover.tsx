import { Popover, PopoverTarget, PopoverDropdown, IconButton, Button } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import { useTranslation } from 'hooks';
import { useTrackingCardEvent } from 'hooks/useTrackingCardEvent';

import { CardName, CardPurpose } from 'utils/Factory/EventCollection/constants/CardEvent';

import styles from './InviteLinkIntroductionPopover.module.scss';

const InviteLinkIntroductionPopover = ({
  children,
  isOpen,
  setOpen,
  handleClosePopover,
  onClickTryItNow,
  setIsHovering,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  handleClosePopover: () => void;
  onClickTryItNow: () => void;
  setIsHovering: (isHovering: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { trackCardViewed, trackCardConfirmation, trackCardDismiss } = useTrackingCardEvent({
    cardName: CardName.INTRODUCE_INVITE_LINK_GUIDELINE,
    cardPurpose: CardPurpose[CardName.INTRODUCE_INVITE_LINK_GUIDELINE],
  });

  const handleDismiss = (): void => {
    setIsHovering(false);
    trackCardDismiss();
    handleClosePopover();
  };

  const handleConfirm = (): void => {
    setIsHovering(false);
    trackCardConfirmation();
    onClickTryItNow();
  };

  useEffect(() => {
    if (isOpen) {
      trackCardViewed();
    }
  }, [isOpen]);

  return (
    <Popover
      opened={isOpen}
      onClose={() => setOpen(false)}
      transitionProps={{ transition: 'pop' }}
      offset={6}
      withArrow
      arrowPosition="center"
      arrowSize={16}
      position="bottom"
      classNames={{
        arrow: styles.popoverArrow,
        dropdown: styles.popoverDropdown,
      }}
      zIndex={199}
    >
      <PopoverTarget>{children}</PopoverTarget>
      <PopoverDropdown
        onClick={(e) => e.stopPropagation()}
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={styles.shareLinkContainer}>
          <IconButton icon="x-md" size="md" className={styles.closeButton} onClick={handleDismiss} />
          <h3 className={styles.shareLinkTitle}>{t('avatarGroupSection.shareLink')}</h3>
          <p className={styles.shareLinkDescription}>{t('avatarGroupSection.shareLinkDescription')}</p>
          <div className={styles.buttonWrapper}>
            <Button size="md" variant="text" className={styles.tryItNow} onClick={handleConfirm}>
              {t('avatarGroupSection.tryItNow')}
            </Button>
          </div>
        </div>
      </PopoverDropdown>
    </Popover>
  );
};

export default InviteLinkIntroductionPopover;
