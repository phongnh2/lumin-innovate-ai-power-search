import { Modal, TextInput } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import ModalFooter from 'lumin-components/ModalFooter';
import Dialog from 'luminComponents/Dialog';
import { DocumentContext } from 'luminComponents/Document/context';
import Input from 'luminComponents/Shared/Input';

import { useEnableWebReskin } from 'hooks/useEnableWebReskin';
import { useTranslation } from 'hooks/useTranslation';

import { documentServices } from 'services';

import { file as fileUtils, toastUtils } from 'utils';
import validator from 'utils/validator';

import { CHECKBOX_TYPE } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';

import './RenameDocumentModal.scss';

const propTypes = {
  document: PropTypes.object,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  isSelectionMode: PropTypes.bool,
  isOnlyRenaming: PropTypes.bool,
};

const defaultProps = {
  document: {},
  onCancel: () => {},
  open: false,
  isSelectionMode: false,
  isOnlyRenaming: false,
};

const RenameDocumentModal = (props) => {
  const { document, onCancel, open, isSelectionMode, isOnlyRenaming } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isEnableReskin } = useEnableWebReskin();
  const currentDocumentName = fileUtils.getFilenameWithoutExtension(document.name);
  const [documentName, setDocumentName] = useState(currentDocumentName);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { handleSelectedItems, lastSelectedDocIdRef } = useContext(DocumentContext);

  const hasNotChangeName = currentDocumentName === documentName;
  const shouldDisableSave = isSaving || !!error || hasNotChangeName || !documentName.trim();

  const _handleChangeName = (event) => {
    const { value } = event.target;
    setDocumentName(value);
    const { error, isValidated } = validator.validateDocumentName(value);
    setError(isValidated ? '' : error);
  };

  const _handleChangeDocumentName = async () => {
    setIsSaving(true);
    try {
      const trimName = documentName.trim();
      const nameWithExtension = await documentServices.renameDocument({ document, newName: trimName, t });
      if (nameWithExtension) {
        onCancel();
        if (isOnlyRenaming) {
          dispatch(actions.updateCurrentDocument({ name: nameWithExtension }));
          return;
        }
        if (isEnableReskin && isSelectionMode) {
          const updatedDocument = { ...document, name: nameWithExtension };
          handleSelectedItems({
            currentItem: updatedDocument,
            lastSelectedDocId: lastSelectedDocIdRef.current,
            checkboxType: CHECKBOX_TYPE.SELECT_ONE,
          });
        }
      }
    } catch (err) {
      toastUtils.error({
        message: t('modalRenameDocument.renameMessageError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const _handleCancel = () => {
    setError('');
    onCancel();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }
    _handleChangeDocumentName();
  };

  if (isEnableReskin) {
    return (
      <Modal
        opened={open}
        title={t('modalRenameDocument.renameDocument')}
        onCancel={_handleCancel}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        confirmButtonProps={{
          title: t('common.save'),
          type: 'submit',
          disabled: shouldDisableSave,
        }}
        size="sm"
        centered
        isProcessing={isSaving}
        onConfirm={onSubmit}
        onClose={_handleCancel}
        onExitTransitionEnd={() => {
          setDocumentName(currentDocumentName);
        }}
      >
        <form onSubmit={onSubmit}>
          <TextInput autoFocus value={documentName} onChange={_handleChangeName} error={error} size="lg" />
        </form>
      </Modal>
    );
  }

  return (
    <Dialog open={open} onClose={onCancel} width={ModalSize.SM}>
      <>
        <h2 className="RenameModal__title">{t('modalRenameDocument.renameDocument')}</h2>
        <form onSubmit={onSubmit} className="RenameModal">
          <div className="RenameModal__input">
            <Input
              onChange={_handleChangeName}
              errorMessage={error}
              value={documentName}
              showClearButton
              hideValidationIcon
              autoFocus
            />
          </div>
          <ModalFooter
            onCancel={_handleCancel}
            disabled={shouldDisableSave}
            loading={isSaving}
            label={t('common.save')}
            smallGap
          />
        </form>
      </>
    </Dialog>
  );
};

RenameDocumentModal.propTypes = propTypes;
RenameDocumentModal.defaultProps = defaultProps;

export default RenameDocumentModal;
