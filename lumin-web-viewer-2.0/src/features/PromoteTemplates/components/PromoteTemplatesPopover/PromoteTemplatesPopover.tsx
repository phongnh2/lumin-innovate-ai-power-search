import { Popover, PopoverTarget, PopoverDropdown, Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import PromoteTemplatesIllustration from 'assets/reskin/images/promote-templates-illustration.png';

import { useTranslation } from 'hooks';

import styles from './PromoteTemplatesPopover.module.scss';

const PromoteTemplatesPopover = ({
  children,
  isOpen,
  onClickLater,
  onClickTryItNow,
  setIsHovering,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClickLater: () => void;
  onClickTryItNow: () => void;
  setIsHovering: (isHovering: boolean) => void;
}) => {
  const { t } = useTranslation();

  const handleDismiss = (): void => {
    setIsHovering(false);
    onClickLater();
  };

  const handleConfirm = (): void => {
    setIsHovering(false);
    onClickTryItNow();
  };

  return (
    <Popover
      opened={isOpen}
      transitionProps={{ transition: 'pop' }}
      offset={10}
      withArrow
      arrowPosition="center"
      arrowSize={23}
      position="right"
      zIndex={301}
    >
      <PopoverTarget>{children}</PopoverTarget>
      <PopoverDropdown
        onClick={(e) => e.stopPropagation()}
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={styles.container}>
          <img
            src={PromoteTemplatesIllustration}
            alt="Promote Templates"
            className={styles.promoteTemplatesIllustration}
          />
          <h3 className={styles.title}>{t('promoteTemplatesPopover.title')}</h3>
          <p className={styles.description}>{t('promoteTemplatesPopover.description')}</p>
          <div className={styles.buttonWrapper}>
            <Button variant="text" className={styles.tryItNow} onClick={handleDismiss}>
              {t('common.later')}
            </Button>
            <Button onClick={handleConfirm}>{t('common.tryItNow')}</Button>
          </div>
        </div>
      </PopoverDropdown>
    </Popover>
  );
};

export default PromoteTemplatesPopover;
