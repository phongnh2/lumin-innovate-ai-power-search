import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import PasswordImageDark from 'assets/images/new-layout/password-img-dark.png';
import PasswordImage from 'assets/images/new-layout/password-img.png';

import { useThemeMode } from 'hooks/useThemeMode';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { PasswordModalType } from 'features/PasswordProtection/constants';
import { passwordProtectionSelectors } from 'features/PasswordProtection/slices';

import ChangePasswordModal from './ChangePasswordModal';
import RemovePasswordModal from './RemovePasswordModal';
import SetPasswordModal from './SetPasswordModal';

const eventNameMapping = {
  [PasswordModalType.SetPassword]: ModalName.ENCRYPT_WITH_PASSWORD,
  [PasswordModalType.ChangePassword]: ModalName.CHANGE_YOUR_PASSWORD,
  [PasswordModalType.RemovePassword]: ModalName.REMOVE_PASSWORD,
};

const PasswordManagerModal = () => {
  const isOpen = useSelector(passwordProtectionSelectors.modalOpened);
  const modalType = useSelector(passwordProtectionSelectors.modalType);

  const theme = useThemeMode();

  const modalIcon = useMemo(
    () =>
      ({
        light: PasswordImage,
        dark: PasswordImageDark,
      }[theme]),
    [theme]
  );

  const modalIconImage = useMemo(
    () => (
      <img
        src={modalIcon}
        style={{
          height: 80,
          width: 'fit-content',
        }}
        alt="password required icon"
      />
    ),
    [modalIcon]
  );

  useEffect(() => {
    if (isOpen && modalType) {
      modalEvent
        .modalViewed({
          modalName: eventNameMapping[modalType],
        })
        .catch(() => {});
    }
  }, [isOpen, modalType]);

  const renderModal = () => {
    switch (modalType) {
      case PasswordModalType.SetPassword: {
        return <SetPasswordModal isOpen={isOpen} modalIcon={modalIconImage} />;
      }
      case PasswordModalType.ChangePassword: {
        return <ChangePasswordModal isOpen={isOpen} modalIcon={modalIconImage} />;
      }
      case PasswordModalType.RemovePassword: {
        return <RemovePasswordModal isOpen={isOpen} modalIcon={modalIconImage} />;
      }
      default: {
        return null;
      }
    }
  };
  return renderModal();
};

export default PasswordManagerModal;
