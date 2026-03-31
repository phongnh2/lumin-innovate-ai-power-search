import hotkeys from 'hotkeys-js';
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import {
  saveFileToCloud,
  saveFileToDevice,
  saveLocalFile,
} from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';
import UploadDocumentModal from 'luminComponents/TransferDocument/components/UploadDocumentModal';
import WarningSaveLocalFileModal from 'luminComponents/WarningSaveLocalFileModal';

import { useTranslation } from 'hooks/useTranslation';

import { useUploadToLuminChecker } from 'features/CustomDomainRules/hooks';

import { general } from 'constants/documentType';
import { LocalStorageKey } from 'constants/localStorageKey';

import styles from './LuminLocalFileButton.module.scss';

const LuminLocalFileButton = ({ isOffline, currentDocument, setUploadDocVisible, uploadDocVisible, currentUser }) => {
  const [openSaveFileModal, setOpenSaveFileModal] = useState(false);
  const { t } = useTranslation();
  const { disabled: disabledUploadToLumin, tooltipData = {} } = useUploadToLuminChecker();

  const saveToLocal = () => {
    saveLocalFile();
  };

  useEffect(() => {
    const confirmedSaveLocal = () => {
      const defaultSaved = localStorage.getItem(LocalStorageKey.SYSTEM_DEFAULT_SAVED);
      if (!defaultSaved) {
        setOpenSaveFileModal(true);
      }
    };
    if (currentDocument.isSystemFile) {
      hotkeys('command+s, ctrl+s', (e) => {
        e.preventDefault();
        saveToLocal();
      });
      window.addEventListener('confirmed_save_local', confirmedSaveLocal);
    }
    return () => {
      if (currentDocument.isSystemFile) {
        window.removeEventListener('confirmed_save_local', confirmedSaveLocal);
        hotkeys.unbind('command+s, ctrl+s');
      }
    };
  }, []);

  if (!currentDocument.isSystemFile) {
    return null;
  }

  return (
    <>
      <PlainTooltip title={tooltipData?.title}>
        <Button
          className={styles.uploadButton}
          disabled={isOffline || disabledUploadToLumin}
          onClick={() =>
            setUploadDocVisible({
              visible: true,
              title: t('modalUploadDoc.uploadFile'),
              submitTitle: t('action.upload'),
            })
          }
          size="lg"
          variant="tonal"
        >
          {t('documentPage.uploadToLumin')}
        </Button>
      </PlainTooltip>
      <div>
        <Button className={styles.saveButton} onClick={saveToLocal} disabled={!currentDocument.unsaved} size="lg" variant="outlined">
          {currentDocument.mimeType === general.PDF ? t('action.save') : t('action.saveAs')}
        </Button>
        {openSaveFileModal && (
          <WarningSaveLocalFileModal
            saveFileToDevice={saveFileToDevice}
            saveFileToCloud={saveFileToCloud}
            onClose={() => setOpenSaveFileModal(false)}
          />
        )}
      </div>
      {currentUser && uploadDocVisible?.visible && (
        <UploadDocumentModal
          visible
          document={currentDocument}
          onClose={() => setUploadDocVisible({ visible: false })}
          title={uploadDocVisible.title}
          submitTitle={uploadDocVisible.submitTitle}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  isOffline: selectors.isLoadingDocument(state),
  currentDocument: selectors.getCurrentDocument(state),
  uploadDocVisible: selectors.getUploadDocVisible(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  setUploadDocVisible: (data) => dispatch(actions.setUploadDocVisible(data)),
});

LuminLocalFileButton.propTypes = {
  isOffline: PropTypes.bool.isRequired,
  currentDocument: PropTypes.object.isRequired,
  setUploadDocVisible: PropTypes.func.isRequired,
  uploadDocVisible: PropTypes.object,
  currentUser: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(LuminLocalFileButton);
