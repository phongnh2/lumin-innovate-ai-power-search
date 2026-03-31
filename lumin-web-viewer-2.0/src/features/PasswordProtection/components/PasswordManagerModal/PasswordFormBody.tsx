import { PasswordInput } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { UseFormRegister } from 'react-hook-form';

import { useTranslation } from 'hooks/useTranslation';

import ErrorMessage from './ErrorMessage';
import ModalFooter from './ModalFooter';

interface PasswordFormBodyProps {
  fields: {
    name: string;
    placeholder: string;
    label: string;
    autoFocus?: boolean;
  }[];
  errorMessage: string;
  loading: boolean;
  onClose: () => void;
  submitText: string;
  cancelText: string;
  register: UseFormRegister<unknown>;
  isFormDirty: boolean;
}

const PasswordFormBody = ({
  fields,
  errorMessage,
  loading,
  onClose,
  submitText,
  cancelText,
  register,
  isFormDirty,
}: PasswordFormBodyProps) => {
  const { t } = useTranslation();
  return (
    <>
      {fields.map((field) => (
        <PasswordInput
          key={field.name}
          autoComplete="new-password"
          placeholder={t(field.placeholder)}
          label={t(field.label)}
          error={!!errorMessage}
          autoFocus={field.autoFocus}
          {...register(field.name as never)}
        />
      ))}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <ModalFooter
        onClose={onClose}
        isFormDirty={isFormDirty}
        submitText={submitText}
        cancelText={cancelText}
        loading={loading}
      />
    </>
  );
};

export default PasswordFormBody;
