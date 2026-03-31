import hotkeys from 'hotkeys-js';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonVariant } from 'lumin-components/ViewerCommon/ButtonMaterial/ButtonVariant';
import WarningSaveLocalFileModal from 'luminComponents/WarningSaveLocalFileModal';

import { useTranslation } from 'hooks';

import { general } from 'constants/documentType';
import { LocalStorageKey } from 'constants/localStorageKey';

import { saveFileToCloud, saveFileToDevice, saveLocalFile } from './helper/saveLocalFile';

import { ButtonSave } from './LocalSave.styled';

const LocalSave = ({ currentDocument }) => {
  const [openSaveFileModal, setOpenSaveFileModal] = useState(false);
  const { t } = useTranslation();
  const saveToLocal = () => {
    saveLocalFile();
  };

  useEffect(() => {
    hotkeys('command+s, ctrl+s', (e) => {
      e.preventDefault();
      saveToLocal();
    });
    const confirmedSaveLocal = () => {
      const defaultSaved = localStorage.getItem(LocalStorageKey.SYSTEM_DEFAULT_SAVED);
      if (!defaultSaved) {
        setOpenSaveFileModal(true);
      }
    };
    window.addEventListener('confirmed_save_local', confirmedSaveLocal);
    return () => {
      window.removeEventListener('confirmed_save_local', confirmedSaveLocal);
      hotkeys.unbind('command+s, ctrl+s');
    };
  }, []);

  return (
    <>
      <ButtonSave
        id="ButtonSave"
        color={ButtonColor.SECONDARY_BLACK}
        variant={ButtonVariant.OUTLINED}
        onClick={saveToLocal}
        disabled={!currentDocument.unsaved}
      >
        {currentDocument.mimeType === general.PDF ? t('action.save') : t('action.saveAs')}
      </ButtonSave>
      {openSaveFileModal && (
        <WarningSaveLocalFileModal
          saveFileToDevice={saveFileToDevice}
          saveFileToCloud={saveFileToCloud}
          onClose={() => setOpenSaveFileModal(false)}
        />
      )}
    </>
  );
};

LocalSave.propTypes = {
  currentDocument: PropTypes.object.isRequired,
};

export default LocalSave;
