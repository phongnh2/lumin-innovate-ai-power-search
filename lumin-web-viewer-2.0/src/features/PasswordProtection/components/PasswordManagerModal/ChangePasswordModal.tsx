import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import toastUtils from '@new-ui/utils/toastUtils';

import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import { MAX_PDF_PASSWORD_LENGTH, MIN_PDF_PASSWORD_LENGTH } from 'utils/password';
import Yup from 'utils/yup';

import { usePasswordHandler } from 'features/PasswordProtection/hooks/usePasswordHandler';

import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_ALL_FIELDS_REQUIRED, ERROR_MESSAGE_PASSWORD_DO_NOT_MATCH } from 'constants/messages';

import PasswordDialog from './PasswordDialog';
import PasswordFormBody from './PasswordFormBody';

import styles from './PasswordManagerModal.module.scss';

interface ChangePasswordModalProps {
  isOpen: boolean;
  modalIcon: React.ReactNode;
}

const ChangePasswordModal = ({ modalIcon, isOpen }: ChangePasswordModalProps) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        currentPassword: Yup.string().required(ERROR_MESSAGE_ALL_FIELDS_REQUIRED),
        newPassword: Yup.string()
          .required(t(ERROR_MESSAGE_ALL_FIELDS_REQUIRED))
          .min(MIN_PDF_PASSWORD_LENGTH, t('errorMessage.minPassword', { min: MIN_PDF_PASSWORD_LENGTH }))
          .max(MAX_PDF_PASSWORD_LENGTH, t('errorMessage.maxPassword', { max: MAX_PDF_PASSWORD_LENGTH })),
        reEnterNewPassword: Yup.string()
          .required(t(ERROR_MESSAGE_ALL_FIELDS_REQUIRED))
          .oneOf([Yup.ref('newPassword'), null], t(ERROR_MESSAGE_PASSWORD_DO_NOT_MATCH)),
      }),
    [t]
  );

  const { register, handleSubmit, formState, setError, reset } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      reEnterNewPassword: '',
    },
    shouldFocusError: true,
    resolver: yupResolver(validationSchema),
  });
  const { closePasswordProtectionModal, changePassword, errorHandler, loading } = usePasswordHandler({
    modalName: ModalName.CHANGE_YOUR_PASSWORD,
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
        modalName: ModalName.CHANGE_YOUR_PASSWORD,
      })
      .catch(() => {});
  };

  const onSubmit = async ({ currentPassword, newPassword }: { newPassword: string; currentPassword: string }) => {
    try {
      await changePassword({ currentPassword, newPassword });
      onClose();
      toastUtils.success({
        message: t('viewer.passwordProtection.successMessage.changePassword'),
      });
    } catch (err) {
      logger.logError({ error: err, reason: LOGGER.Service.PASSWORD_PROTECTION });
      setError('currentPassword', {
        message: errorHandler(err),
      });
    }
  };

  const onSubmitWithTracking = async ({
    currentPassword,
    newPassword,
  }: {
    newPassword: string;
    currentPassword: string;
  }) => {
    await onSubmit({ currentPassword, newPassword });
    trackingSubmitEvent();
  };

  const errorMessage = Object.values(formState.errors).map((err) => err?.message.toString())[0];

  const fields: {
    label: string;
    placeholder: string;
    name: 'currentPassword' | 'newPassword' | 'reEnterNewPassword';
    autoFocus?: boolean;
  }[] = [
    {
      label: 'settingGeneral.currentPassword',
      placeholder: 'viewer.passwordProtection.enterCurrentPassword',
      name: 'currentPassword',
      autoFocus: true,
    },
    {
      label: 'settingGeneral.newPassword',
      placeholder: 'viewer.passwordProtection.enterNewPassword',
      name: 'newPassword',
    },
    {
      label: 'settingGeneral.reEnterNewPassword',
      placeholder: 'viewer.passwordProtection.reEnterNewPassword',
      name: 'reEnterNewPassword',
    },
  ];

  return (
    <PasswordDialog
      opened={isOpen}
      onClose={onClose}
      Image={modalIcon}
      title={t('viewer.passwordProtection.changePasswordModal.title')}
    >
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmitWithTracking)}>
        <PasswordFormBody
          fields={fields}
          errorMessage={errorMessage}
          loading={loading}
          onClose={onClose}
          submitText={t('action.save')}
          cancelText={t('common.cancel')}
          register={register}
          isFormDirty={formState.isDirty}
        />
      </form>
    </PasswordDialog>
  );
};

export default ChangePasswordModal;
