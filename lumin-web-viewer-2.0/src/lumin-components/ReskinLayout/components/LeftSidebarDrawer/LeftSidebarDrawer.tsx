import { Button, Drawer, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { AgreementGenSubSidebar } from '@web-new-ui/components/LeftSubSidebar/components/AgreementGenSubSidebar';
import { DashboardSubSidebar } from '@web-new-ui/components/LeftSubSidebar/components/DashboardSubSidebar';
import { DocumentSubSidebar } from '@web-new-ui/components/LeftSubSidebar/components/DocumentSubSidebar';
import { SignSubSidebar } from '@web-new-ui/components/LeftSubSidebar/components/SignSubSidebar';

import { useTranslation } from 'hooks';

import { OrganizationSwitcher, NavigationItems } from './components';
import { useAutoCloseDrawer, useRenderToggledModal, useToggleModalType, useToggleSubMenu } from './hooks';
import { SubMenuTypes } from './LeftSidebarDrawer.constants';
import { OrganizationSubSidebar } from '../LeftSubSidebar/components/OrganizationSubSidebar';

import styles from './LeftSidebarDrawer.module.scss';

type LeftSidebarDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

const transitionProps = {
  duration: 300,
  transition: {
    in: { opacity: 1, transform: 'translateX(0)' },
    out: { opacity: 1, transform: 'translateX(-100%)' },
    common: { transformOrigin: 'right' },
    transitionProperty: 'transform',
  },
};

const LeftSidebarDrawer = ({ opened, onClose }: LeftSidebarDrawerProps) => {
  const { t } = useTranslation();

  const { modalType, toggleModalType } = useToggleModalType();
  const { subMenu, toggleSubMenu } = useToggleSubMenu();

  const onCloseSubMenu = () => toggleSubMenu(null);

  const onCloseModal = () => toggleModalType(null);

  const onCloseDrawer = () => {
    onCloseSubMenu();
    onClose();
  };

  const { renderModalByType } = useRenderToggledModal({ onClose: onCloseModal });

  useAutoCloseDrawer({ onClose: onCloseDrawer });

  const customedClassNames = useMemo(
    () => ({
      body: styles.drawerBody,
      content: styles.drawerContent,
    }),
    []
  );

  const subMenuItems = useMemo(
    () =>
      ({
        [SubMenuTypes.Documents]: <DocumentSubSidebar />,
        [SubMenuTypes.Templates]: <OrganizationSubSidebar type={SubMenuTypes.Templates} />,
        [SubMenuTypes.Settings]: <DashboardSubSidebar />,
        [SubMenuTypes.Signs]: <SignSubSidebar onCloseDrawer={onCloseDrawer} />,
        [SubMenuTypes.AgreementGen]: <AgreementGenSubSidebar onCloseDrawer={onCloseDrawer} />,
      }[subMenu]),
    [subMenu]
  );

  return (
    <>
      {/* Main content */}
      <Drawer
        classNames={customedClassNames}
        transitionProps={transitionProps}
        width={280}
        position="left"
        opened={opened}
        onClose={onCloseDrawer}
        zIndex={subMenu ? 'var(--zindex-kiwi-modal-low)' : 'var(--zindex-kiwi-modal-medium)'}
      >
        <OrganizationSwitcher toggleModalType={toggleModalType} onCloseDrawer={onCloseDrawer} />
        <NavigationItems toggleSubMenu={toggleSubMenu} toggleModalType={toggleModalType} />
      </Drawer>

      {/* Sub content */}
      <Drawer
        width={280}
        position="left"
        withOverlay={false}
        closeOnClickOutside={false}
        opened={Boolean(subMenu)}
        onClose={onCloseSubMenu}
        classNames={customedClassNames}
        transitionProps={transitionProps}
      >
        <Button
          size="md"
          variant="text"
          startIcon={<Icomoon type="arrow-narrow-left-md" />}
          onClick={onCloseSubMenu}
          data-cy="back_to_main_menu_button_drawer"
        >
          {t('common.mainMenu')}
        </Button>
        <div className={styles.subSidebarContainer}>{subMenuItems}</div>
      </Drawer>

      {/* Portal Modal */}
      {renderModalByType(modalType)}
    </>
  );
};

export default LeftSidebarDrawer;
