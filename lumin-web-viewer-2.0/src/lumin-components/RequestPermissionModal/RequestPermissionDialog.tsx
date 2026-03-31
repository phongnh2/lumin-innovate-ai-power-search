/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Modal, Textarea as KiwiTextarea } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { ThemeProvider } from 'styled-components';

import Dialog from 'lumin-components/Dialog';
import ModalFooter from 'lumin-components/ModalFooter';
import Textarea from 'luminComponents/Shared/Textarea';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ModalSize } from 'constants/styles/Modal';

import { MAX_LENGTH } from './constants';

import * as Styled from './RequestPermissionModal.styled';

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
  themeModeProvider: unknown;
  textRequestModal: string;
  onClose: () => void;
  handleCancel: () => void;
  handleSubmitMessage: (data: any) => void;
}

const RequestPermissionDialog = (props: IProps): JSX.Element => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const {
    isSubmitting,
    errors,
    handleCancel,
    control,
    themeModeProvider,
    onClose,
    handleSubmit,
    textRequestModal,
    handleSubmitMessage,
  } = props;

  if (isEnableReskin) {
    return (
      <Modal
        opened
        centered
        size="sm"
        title={t(textRequestModal)}
        onCancel={handleCancel}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        confirmButtonProps={{
          title: t('common.send'),
          type: 'submit',
          disabled: isSubmitting,
        }}
        isProcessing={isSubmitting}
        onConfirm={handleSubmit(handleSubmitMessage)}
        onClose={onClose}
      >
        <Controller
          control={control}
          name={'message' as never}
          render={({ field: { value, onChange } }) => (
            <KiwiTextarea
              autoFocus
              styles={{ input: { height: '80px' } }}
              value={value}
              error={errors.message?.message as string}
              placeholder={t('modalShare.messageLessThanCharacters', {
                number: MAX_LENGTH,
              })}
              maxLength={MAX_LENGTH}
              disabled={isSubmitting}
              onChange={onChange}
            />
          )}
        />
      </Modal>
    );
  }

  return (
    <ThemeProvider theme={themeModeProvider}>
      {/* @ts-ignore */}
      <Dialog open onClose={onClose} width={ModalSize.MD}>
        <Styled.ModalContainer>
          <Styled.Title>{t(textRequestModal)}</Styled.Title>
          <Styled.InputContainer>
            <Controller
              control={control}
              name={'message' as never}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  value={value}
                  errorMessage={errors.message?.message as string}
                  placeholder={t('modalShare.messageLessThanCharacters', {
                    number: MAX_LENGTH,
                  })}
                  maxLength={MAX_LENGTH}
                  disabled={isSubmitting}
                  onChange={onChange}
                  autoFocus
                />
              )}
            />
          </Styled.InputContainer>
          <ModalFooter
            onCancel={handleCancel}
            onSubmit={handleSubmit(handleSubmitMessage)}
            label={t('common.send')}
            loading={isSubmitting}
          />
        </Styled.ModalContainer>
      </Dialog>
    </ThemeProvider>
  );
};

export default RequestPermissionDialog;
