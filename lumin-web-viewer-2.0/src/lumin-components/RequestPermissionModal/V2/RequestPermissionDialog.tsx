import React from 'react';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';

import Modal from '@new-ui/general-components/Modal';
import TextArea from '@new-ui/general-components/TextArea';

import { useTranslation } from 'hooks/useTranslation';

import { MAX_LENGTH } from '../constants';

interface IProps {
  control: Control<
    {
      [x: string]: any;
    },
    any
  >;
  handleSubmit: UseFormHandleSubmit<
    {
      [x: string]: any;
    },
    undefined
  >;
  isSubmitting: boolean;
  errors: FieldErrors<{
    [x: string]: any;
  }>;
  textRequestModal: string;
  onClose: () => void;
  handleCancel: () => void;
  handleSubmitMessage: (data: any) => void;
}

const RequestPermissionDialog = (props: IProps): JSX.Element => {
  const { t } = useTranslation();
  const { isSubmitting, errors, handleCancel, control, onClose, handleSubmit, textRequestModal, handleSubmitMessage } =
    props;
  return (
    <Modal
      open
      onClose={onClose}
      footerVariant="variant1"
      secondaryText={t('common.cancel')}
      onSecondaryClick={handleCancel}
      primaryText={t('common.send')}
      onPrimaryClick={handleSubmit(handleSubmitMessage)}
      primaryButtonProps={{
        isLoading: isSubmitting,
      }}
      title={t(textRequestModal)}
      PaperProps={{ onMouseDown: (e) => e.stopPropagation() }}
    >
      <Controller
        control={control}
        name={'message' as never}
        render={({ field: { value, onChange } }) => (
          <TextArea
            value={value}
            errorText={errors.message?.message as string}
            placeholder={t('modalShare.messageLessThanCharacters', {
              number: MAX_LENGTH,
            })}
            maxLength={MAX_LENGTH}
            disabled={isSubmitting}
            onChange={onChange}
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
          />
        )}
      />
    </Modal>
  );
};

export default RequestPermissionDialog;
