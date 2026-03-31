import { yupResolver } from '@hookform/resolvers/yup';
import { PasswordInput } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import toastUtils from '@new-ui/utils/toastUtils';

import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import Yup from 'utils/yup';

import { usePasswordHandler } from 'features/PasswordProtection/hooks/usePasswordHandler';

import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_ALL_FIELDS_REQUIRED } from 'constants/messages';

import ErrorMessage from './ErrorMessage';
import ModalFooter from './ModalFooter';
import PasswordDialog from './PasswordDialog';

import styles from './PasswordManagerModal.module.scss';

interface RemovePasswordModalProps {
  isOpen: boolean;
  modalIcon: React.ReactNode;
}

const RemovePasswordModal = ({ modalIcon, isOpen }: RemovePasswordModalProps) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        currentPassword: Yup.string().required(t(ERROR_MESSAGE_ALL_FIELDS_REQUIRED)),
      }),
    [t]
  );
  const { register, handleSubmit, formState, setError, reset } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      currentPassword: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const { closePasswordProtectionModal, removePassword, errorHandler, loading } = usePasswordHandler({
    modalName: ModalName.REMOVE_PASSWORD,
  });

  const onClose = () => {
    if (loading) {
      return;
    }
    reset();
    closePasswordProtectionModal();
  };

  const trackingSubmitEvent = () => {
    modalEvent
      .modalConfirmation({
        modalName: ModalName.REMOVE_PASSWORD,
      })
      .catch(() => {});
  };

  const onSubmit = async ({ currentPassword }: { currentPassword: string }) => {
    try {
      await removePassword(currentPassword);
      onClose();
      toastUtils.success({
        message: t('viewer.passwordProtection.successMessage.removePassword'),
      });
    } catch (err: unknown) {
      logger.logError({
        error: err,
        reason: LOGGER.Service.PASSWORD_PROTECTION,
        message: 'Remove password failed',
      });
      setError('currentPassword', {
        message: errorHandler(err),
      });
    }
  };
  const onSubmitWithTracking = async ({ currentPassword }: { currentPassword: string }) => {
    await onSubmit({ currentPassword });
    trackingSubmitEvent();
  };

  const errorMessage = Object.values(formState.errors).map((err) => err?.message.toString())[0];

  return (
    <PasswordDialog
      opened={isOpen}
      onClose={onClose}
      Image={modalIcon}
      title={t('viewer.passwordProtection.removePasswordModal.title')}
    >
      <h3 className={styles.content}>{t('viewer.passwordProtection.removePasswordModal.desc')}</h3>
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmitWithTracking)}>
        <PasswordInput
          autoFocus
          autoComplete="new-password"
          placeholder={t('settingGeneral.yourPassword')}
          error={!!errorMessage}
          {...register('currentPassword')}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <ModalFooter
          onClose={onClose}
          submitText={t('common.remove')}
          cancelText={t('common.cancel')}
          loading={loading}
          isFormDirty={formState.isDirty}
        />
      </form>
    </PasswordDialog>
  );
};

export default RemovePasswordModal;
