import { Menu, MenuItem, MenuItemSize, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import { useLeftSideBarFeatureValidation } from '@new-ui/components/LuminLeftSideBar/hooks/useLeftSideBarFeatureValidation';
import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';
import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import PremiumIcon from 'assets/lumin-svgs/badge_premium.svg';

import IcomoonV1 from 'lumin-components/Icomoon';
import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { documentSyncSelectors } from 'features/Document/slices';
import { AppFeatures } from 'features/FeatureConfigs';
import { usePasswordHandler } from 'features/PasswordProtection';
import PasswordManagerModal from 'features/PasswordProtection/components/PasswordManagerModal';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { ToolbarItemContext } from './ToolbarItem';

import styles from './PasswordSettingMenu.module.scss';

export const PASSWORD_MENU_RENDER_MODE = {
  SET_OR_CHANGE: 'SET_OR_CHANGE',
  REMOVE: 'REMOVE',
  DEFAULT: 'DEFAULT',
};

const premiumIconImage = <img src={PremiumIcon} alt="premium icon" width={16} />;

interface PasswordSettingMenuProps {
  renderMode?: keyof typeof PASSWORD_MENU_RENDER_MODE;
}

const PasswordSettingMenu = ({ renderMode }: PasswordSettingMenuProps) => {
  const { t } = useTranslation();
  const passwordButtonRef = useRef<HTMLButtonElement>(null);
  const [passwordPopperOpen, setPasswordPopperOpen] = useState(false);
  const { isTemplateViewer } = useTemplateViewerMatch();

  const currentUser = useGetCurrentUser();
  const { isOffline } = useNetworkStatus();

  const { renderAsMenuItem, onChangeNavigationTab } = useContext(ToolbarItemContext);

  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);
  const hoveredNavigationTabs = useSelector(leftSideBarSelectors.hoveredNavigationTabs);

  const { isFeatureDisabled: isDisabledSecurityHandlers, getTooltipContent: getPasswordValidationTooltipContent } =
    useLeftSideBarFeatureValidation();

  const {
    openSetPasswordModal,
    openChangePasswordModal,
    openRemovePasswordModal,
    canSet,
    canChange,
    canDelete,
    canEnable,
    refetchPasswordPermissionCheck,
    isPersonalDoc,
  } = usePasswordHandler({ onChangeNavigationTab });

  const isDisableMenuItem = isOffline || !canEnable;

  const closePopper = useCallback(() => {
    setPasswordPopperOpen(false);
  }, []);

  const getTooltip = () => {
    switch (true) {
      case canEnable:
        return null;
      case isDocumentSyncing:
        return t('viewer.waitingForDocumentEdit');
      case !currentUser:
        return t('viewer.makeACopy.messageSignInRequired');
      case isDisabledSecurityHandlers:
        return getPasswordValidationTooltipContent({ validateMimeType: true, allowInTempEditMode: false });
      default:
        return t('viewer.passwordProtection.noPermission', { context: isPersonalDoc ? 'personal' : null });
    }
  };

  const renderRemoveItem = () => (
    <PlainTooltip content={getTooltip()}>
      <MenuItem
        onClick={openRemovePasswordModal}
        data-cy="remove_password"
        leftSection={<IcomoonV1 size={24} className="remove-password" />}
        disabled={!canDelete || isDisableMenuItem}
        data-lumin-btn-name={ButtonName.REMOVE_PASSWORD}
      >
        {t('common.removePassword')}
      </MenuItem>
    </PlainTooltip>
  );

  const renderSetAndChangeItems = () => (
    <AvailabilityToolCheckProvider
      useModal
      toolName={TOOLS_NAME.PASSWORD_PROTECTION}
      featureName={AppFeatures.SET_PASSWORD}
      eventName={PremiumToolsPopOverEvent.PasswordProtection}
      render={({ isToolAvailable, shouldShowPremiumIcon, toggleCheckPopper }) => (
        <>
          {canSet && (
            <PlainTooltip content={getTooltip()}>
              <MenuItem
                onClick={isToolAvailable ? openSetPasswordModal : toggleCheckPopper}
                data-cy="set_password"
                data-lumin
                leftSection={<IcomoonV1 size={24} className="set-password" />}
                data-lumin-btn-name={ButtonName.SET_PASSWORD}
                closeMenuOnClick={!shouldShowPremiumIcon && isToolAvailable}
                disabled={isDisableMenuItem || isTemplateViewer}
              >
                <div className={styles.menuItemLabel}>
                  <span>{t('common.setPassword')}</span>
                  {shouldShowPremiumIcon && premiumIconImage}
                </div>
              </MenuItem>
            </PlainTooltip>
          )}
          {canChange && (
            <PlainTooltip content={getTooltip()}>
              <MenuItem
                onClick={isToolAvailable ? openChangePasswordModal : toggleCheckPopper}
                data-cy="change_password"
                leftSection={<IcomoonV1 size={24} className="set-password" />}
                data-lumin-btn-name={ButtonName.CHANGE_PASSWORD}
                closeMenuOnClick={!shouldShowPremiumIcon}
                disabled={isDisableMenuItem}
              >
                <div className={styles.menuItemLabel}>
                  <span>{t('common.changePassword')}</span>
                  {shouldShowPremiumIcon && premiumIconImage}
                </div>
              </MenuItem>
            </PlainTooltip>
          )}
        </>
      )}
    />
  );

  const renderMenuItems = () => {
    switch (renderMode) {
      case PASSWORD_MENU_RENDER_MODE.SET_OR_CHANGE:
        return renderSetAndChangeItems();
      case PASSWORD_MENU_RENDER_MODE.REMOVE:
        return renderRemoveItem();
      default:
        return (
          <>
            {renderSetAndChangeItems()}
            {renderRemoveItem()}
          </>
        );
    }
  };

  const renderMenu = () => (
    <>
      <Menu
        data-cy="password_setting_menu"
        opened={passwordPopperOpen}
        onClose={closePopper}
        itemSize={MenuItemSize.dense}
        onChange={setPasswordPopperOpen}
        styles={{
          dropdown: {
            minWidth: 200,
          },
        }}
        disabled={isOffline || !canEnable}
        ComponentTarget={
          <div>
            <PlainTooltip content={getTooltip()}>
              <SingleButton
                showArrow
                ref={passwordButtonRef}
                icon="lg_password"
                iconSize={24}
                label={t('common.passwordProtection')}
                disabled={isOffline || (!!currentUser && !canEnable)}
                isActive={passwordPopperOpen}
                data-lumin-btn-name={ButtonName.PASSWORD_PROTECTION}
              />
            </PlainTooltip>
          </div>
        }
      >
        {renderMenuItems()}
      </Menu>
      <PasswordManagerModal />
    </>
  );

  useEffect(() => {
    if (hoveredNavigationTabs.includes(LEFT_SIDE_BAR.SECURITY)) {
      refetchPasswordPermissionCheck().catch(() => {});
    }
  }, [hoveredNavigationTabs]);

  if (renderAsMenuItem) {
    return renderMenuItems();
  }

  return renderMenu();
};

export default PasswordSettingMenu;
