import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import toastUtils from '@new-ui/utils/toastUtils';

import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import { MAX_PDF_PASSWORD_LENGTH, MIN_PDF_PASSWORD_LENGTH } from 'utils/password';
import { updateUserMetadataFromFLPSearchParams } from 'utils/updateUserMetadata';
import Yup from 'utils/yup';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import { usePasswordHandler } from 'features/PasswordProtection/hooks/usePasswordHandler';

import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_ALL_FIELDS_REQUIRED, ERROR_MESSAGE_PASSWORD_DO_NOT_MATCH } from 'constants/messages';

import PasswordDialog from './PasswordDialog';
import PasswordFormBody from './PasswordFormBody';

import styles from './PasswordManagerModal.module.scss';

interface SetPasswordModalProps {
  isOpen: boolean;
  modalIcon: React.ReactNode;
}

const SetPasswordModal = ({ modalIcon, isOpen }: SetPasswordModalProps) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        password: Yup.string()
          .required(t(ERROR_MESSAGE_ALL_FIELDS_REQUIRED))
          .min(MIN_PDF_PASSWORD_LENGTH, t('errorMessage.minPassword', { min: MIN_PDF_PASSWORD_LENGTH }))
          .max(MAX_PDF_PASSWORD_LENGTH, t('errorMessage.maxPassword', { max: MAX_PDF_PASSWORD_LENGTH })),
        reEnterPassword: Yup.string()
          .required(t(ERROR_MESSAGE_ALL_FIELDS_REQUIRED))
          .oneOf([Yup.ref('password'), null], t(ERROR_MESSAGE_PASSWORD_DO_NOT_MATCH)),
      }),
    [t]
  );
  const { setPassword, closePasswordProtectionModal, errorHandler, loading } = usePasswordHandler({
    modalName: ModalName.ENCRYPT_WITH_PASSWORD,
  });
  const { register, handleSubmit, formState, setError, reset } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      password: '',
      reEnterPassword: '',
    },
    resolver: yupResolver(validationSchema),
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
        modalName: ModalName.ENCRYPT_WITH_PASSWORD,
      })
      .catch(() => {});
  };

  const onSubmit = async ({ password }: { password: string }) => {
    try {
      await setPassword(password);
      await updateUserMetadataFromFLPSearchParams(PdfAction.PROTECT_PDF, ExploredFeatureKeys.PROTECT_PDF);
      onClose();
      toastUtils.success({
        message: t('viewer.passwordProtection.successMessage.setPassword'),
      });
    } catch (err: unknown) {
      logger.logError({ error: err, reason: LOGGER.Service.PASSWORD_PROTECTION });
      setError('password', {
        message: errorHandler(err),
      });
    }
  };

  const onSubmitWithTracking = async ({ password }: { password: string }) => {
    await onSubmit({ password });
    trackingSubmitEvent();
  };

  const errorMessage = Object.values(formState.errors).map((err) => err?.message.toString())[0];

  const fields: { label: string; placeholder: string; name: 'password' | 'reEnterPassword'; autoFocus?: boolean }[] = [
    {
      label: 'settingGeneral.newPassword',
      placeholder: 'viewer.passwordProtection.enterNewPassword',
      name: 'password',
      autoFocus: true,
    },
    {
      label: 'settingGeneral.reEnterNewPassword',
      placeholder: 'viewer.passwordProtection.reEnterNewPassword',
      name: 'reEnterPassword',
    },
  ];

  return (
    <PasswordDialog
      opened={isOpen}
      onClose={onClose}
      Image={modalIcon}
      title={t('viewer.passwordProtection.setPasswordModal.title')}
    >
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmitWithTracking)}>
        <PasswordFormBody
          fields={fields}
          errorMessage={errorMessage}
          loading={loading}
          onClose={onClose}
          submitText={t('common.apply')}
          cancelText={t('common.cancel')}
          register={register}
          isFormDirty={formState.isDirty}
        />
      </form>
    </PasswordDialog>
  );
};

export default SetPasswordModal;
