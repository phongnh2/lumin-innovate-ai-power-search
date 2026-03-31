import { MenuItemBase } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Menu, MenuAnimation, Item, useContextMenu, animation } from 'react-contexify';

import { useEnableWebReskin, useTranslation } from 'hooks';

import styles from './ContextMenu.module.scss';

type ContextMenuProps = {
  id: string;
  children: React.ReactNode;
  openInNewTab(): void;
  openInCurrentTab(): void;
};

const animationProps: MenuAnimation = {
  enter: animation.scale,
  exit: false,
};

const ContextMenu = ({ id, children, openInNewTab, openInCurrentTab }: ContextMenuProps) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { show } = useContextMenu();

  const renderMenuItems = () => {
    const MenuItem = isEnableReskin ? MenuItemBase : Item;
    return (
      <>
        <MenuItem onClick={openInNewTab}>{t('documentPage.openInNewTab')}</MenuItem>
        <MenuItem onClick={openInCurrentTab}>{t('documentPage.openInCurrentTab')}</MenuItem>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div
        onContextMenu={(e) =>
          show(e, {
            id,
          })
        }
      >
        {children}
      </div>
      <Menu id={id} className={isEnableReskin && styles.menu} animation={animationProps}>
        {renderMenuItems()}
      </Menu>
    </div>
  );
};

export default React.memo(ContextMenu);
