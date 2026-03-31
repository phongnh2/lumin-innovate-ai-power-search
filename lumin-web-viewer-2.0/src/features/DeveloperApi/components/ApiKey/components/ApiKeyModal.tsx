import { Modal, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import { useTranslation } from 'hooks';

import { IApiKey } from 'services/developerApiServices';

import developerApiStyles from '../../../DeveloperApi.module.scss';
import { ModalType } from '../hooks/useApiKey';
import useApiKeyForm from '../hooks/useApiKeyForm';

interface ApiKeyModalProps {
  selectedKey: IApiKey;
  openType: ModalType;
  handleCloseModal: () => void;
  createApiKey: ({ name }: { name: string }) => Promise<void>;
  errorText: string;
  renameApiKey: ({ name }: { name: string }) => Promise<void>;
}

const ApiKeyModal = ({
  selectedKey,
  openType,
  handleCloseModal,
  createApiKey,
  errorText,
  renameApiKey,
}: ApiKeyModalProps) => {
  const { t } = useTranslation();

  const { formState, handleSubmit, register, reset, setValue } = useApiKeyForm();

  const onSubmit = (e: React.BaseSyntheticEvent<object, any, any>) => {
    e.preventDefault();
    if (formState.isSubmitting) {
      return;
    }
    if (openType === ModalType.CREATE) {
      handleSubmit(createApiKey)(e);
    } else {
      handleSubmit(renameApiKey)(e);
    }
  };

  useEffect(() => {
    if (openType === ModalType.RENAME) {
      setValue('name', selectedKey.name);
    }
  }, [openType, reset, selectedKey, setValue]);

  return (
    <Modal
      opened
      size="sm"
      title={openType === ModalType.CREATE ? t('developerApi.newApiKey') : t('developerApi.renameApiKey')}
      onClose={handleCloseModal}
      onCancel={handleCloseModal}
      onConfirm={onSubmit}
      confirmButtonProps={{
        title: openType === ModalType.CREATE ? t('common.generate') : t('common.save'),
        disabled: !formState.isValid || !formState.isDirty,
      }}
      cancelButtonProps={{
        title: t('common.cancel'),
      }}
      isProcessing={formState.isSubmitting}
    >
      <form onSubmit={onSubmit}>
        <TextInput
          autoFocus
          size="lg"
          placeholder={t('common.eg', { egText: 'Test key' })}
          className={developerApiStyles.callbackInput}
          error={formState.errors.name?.message || errorText}
          {...register('name')}
        />
      </form>
    </Modal>
  );
};
export default ApiKeyModal;
