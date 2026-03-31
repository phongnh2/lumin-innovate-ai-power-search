import { yupResolver } from '@hookform/resolvers/yup';
import { InlineMessage, Modal } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Dialog from 'lumin-components/Dialog';
import ModalFooter from 'lumin-components/ModalFooter';
import Input from 'lumin-components/Shared/Input';
import { TextInput } from 'luminComponents/ReskinLayout/components/TextInput';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { getErrorMessageTranslated } from 'utils';
import Yup, { yupValidator } from 'utils/yup';

import { ASSOCIATE_DOMAIN_MODAL_TYPE } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './ModalAssociateDomainController.styled';

import styles from './ModalAssociateDomainController.module.scss';

const ModalAssociateDomainController = ({
  modalType,
  title,
  defaultDomain,
  errorMessage,
  submitLabel,
  onSubmit,
  closeDialog,
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const isEditModal = modalType === ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT;

  const schema = useMemo(
    () =>
      Yup.object().shape({
        domain: yupValidator().domainRequired,
      }),
    []
  );

  const {
    control, handleSubmit, formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      domain: defaultDomain,
    },
    resolver: yupResolver(schema),
  });

  const submit = async ({ domain: _domain }) => {
    await onSubmit({ domain: _domain });
  };

  if (isEnableReskin) {
    return (
      <Modal
        opened
        onClose={closeDialog}
        title={title}
        onCancel={closeDialog}
        onConfirm={handleSubmit(submit)}
        loading={formState.isSubmitting}
        confirmButtonProps={{
          disabled: !formState.isValid || (isEditModal && !formState.isDirty),
          title: submitLabel,
          loading: formState.isSubmitting,
        }}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
      >
        {errorMessage && <InlineMessage type="error" message={errorMessage} />}
        <div className={styles.noteWrapper}>
          <p className={styles.noteTitle}>{t('orgSettings.importantNotes')}</p>
          <ul className={styles.noteList}>
            <li className={styles.noteItem}>{t('orgSettings.importantNotesList1')}</li>
            <li className={styles.noteItem}>
              {isEditModal ? t('orgSettings.importantNoteEdit') : t('orgSettings.importantNoteAdd')}
            </li>
          </ul>
        </div>
        <Controller
          control={control}
          name="domain"
          render={({ field: { ...rest } }) => (
            <TextInput
              autoFocus
              label={t('orgSettings.domain')}
              placeholder={t('common.eg', { egText: 'luminpdf.com' })}
              size="lg"
              error={getErrorMessageTranslated(formState.errors.domain?.message)}
              {...rest}
            />
          )}
        />
      </Modal>
    );
  }

  return (
    <Dialog open onClose={closeDialog} width={ModalSize.SM}>
      <Styled.Title>{title}</Styled.Title>
      {errorMessage && (
        <Styled.ErrorWrapper>
          <Styled.Error>{errorMessage}</Styled.Error>
        </Styled.ErrorWrapper>
      )}
      <Styled.NoteWrapper>
        <Styled.NoteTitle>{t('orgSettings.importantNotes')}</Styled.NoteTitle>
        <Styled.NoteList>
          <Styled.ListItem>{t('orgSettings.importantNotesList1')}</Styled.ListItem>
          <Styled.ListItem>
            {isEditModal ? t('orgSettings.importantNoteEdit') : t('orgSettings.importantNoteAdd')}
          </Styled.ListItem>
        </Styled.NoteList>
      </Styled.NoteWrapper>
      <Styled.InputWrapper>
        <Controller
          control={control}
          name="domain"
          render={({ field: { ...rest } }) => (
            <Input
              label={t('orgSettings.domain')}
              placeholder={t('common.eg', { egText: 'luminpdf.com' })}
              errorMessage={getErrorMessageTranslated(formState.errors.domain?.message)}
              autoFocus
              showClearButton
              {...rest}
            />
          )}
        />
      </Styled.InputWrapper>
      <Styled.ButtonWrapper>
        <ModalFooter
          onCancel={closeDialog}
          onSubmit={handleSubmit(submit)}
          disabled={!formState.isValid || (isEditModal && !formState.isDirty)}
          loading={formState.isSubmitting}
          label={submitLabel}
          smallGap
        />
      </Styled.ButtonWrapper>
    </Dialog>
  );
};

ModalAssociateDomainController.propTypes = {
  modalType: PropTypes.string,
  title: PropTypes.string,
  defaultDomain: PropTypes.string,
  errorMessage: PropTypes.string,
  submitLabel: PropTypes.string,
  onSubmit: PropTypes.func,
  closeDialog: PropTypes.func,
};

ModalAssociateDomainController.defaultProps = {
  modalType: '',
  title: '',
  defaultDomain: '',
  errorMessage: '',
  submitLabel: '',
  onSubmit: () => {},
  closeDialog: () => {},
};

export default ModalAssociateDomainController;
