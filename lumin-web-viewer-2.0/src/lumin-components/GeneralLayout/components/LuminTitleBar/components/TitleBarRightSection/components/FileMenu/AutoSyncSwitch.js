import { MenuItem, Switch } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import SvgElement from 'luminComponents/SvgElement';

import useDocumentTools from 'hooks/useDocumentTools';
import useShallowSelector from 'hooks/useShallowSelector';

import { saveHubspotProperties } from 'services/userServices';

import { isAutoSync, toggleAutoSync as toggleAutoSyncHelper } from 'helpers/autoSync';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { LocalStorageKey } from 'constants/localStorageKey';
import { STORAGE_TYPE } from 'constants/lumin-common';

import styles from './AutoSyncSwitch.module.scss';

export const AutoSync = (props) => {
  const { currentDocument, isLoadingDocument, setCurrentDocument } = props;
  const { enableGoogleSync, _id: documentId } = currentDocument;
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isDisabled = currentDocument.isOverTimeLimit || isLoadingDocument;
  const isGoogleDriveDocument = currentDocument?.service === STORAGE_TYPE.GOOGLE;
  const isAutoSyncEnabled = isAutoSync(currentDocument);
  const { handleDocStackForSyncExternalFile } = useDocumentTools();

  const getAutoSyncStatusKey = (_enableGoogleSync) => {
    if (_enableGoogleSync) return LocalStorageKey.ENABLED_AUTO_SYNC_DOCUMENTS;
    return LocalStorageKey.DISABLED_AUTO_SYNC_DOCUMENTS;
  };

  const getLuminDataAttributes = () => {
    const autoSyncStatusKey = getAutoSyncStatusKey(enableGoogleSync);
    const autoSyncDocuments = JSON.parse(localStorage.getItem(autoSyncStatusKey)) || {};
    if (!autoSyncDocuments[documentId]) {
      const btnName = !enableGoogleSync ? ButtonName.TURN_ON_AUTO_SYNC : ButtonName.TURN_OFF_AUTO_SYNC;
      return {
        'data-lumin-btn-name': btnName,
        'data-lumin-btn-purpose': ButtonPurpose[btnName],
      };
    }
    return {};
  };

  const syncAction = (_enabledGoogleAutoSync) => {
    toggleAutoSyncHelper(documentId, _enabledGoogleAutoSync);
    setCurrentDocument({ ...currentDocument, enableGoogleSync: _enabledGoogleAutoSync });
    const autoSyncStatusKey = getAutoSyncStatusKey(_enabledGoogleAutoSync);
    const autoSyncDocuments = JSON.parse(localStorage.getItem(autoSyncStatusKey)) || {};
    if (!autoSyncDocuments[documentId]) {
      autoSyncDocuments[documentId] = true;
      localStorage.setItem(autoSyncStatusKey, JSON.stringify(autoSyncDocuments));
      if (_enabledGoogleAutoSync) {
        saveHubspotProperties({
          key: HUBSPOT_CONTACT_PROPERTIES.SYNC_DOCUMENT,
          value: 'true',
        }).catch(() => {});
      }
    }
  };

  const toggleAutoSync = (_enableGoogleSync) =>
    _enableGoogleSync
      ? handleDocStackForSyncExternalFile({ callback: () => syncAction(true), storage: STORAGE_TYPE.GOOGLE })
      : syncAction(false);

  if (!isGoogleDriveDocument || !currentUser || !isAutoSyncEnabled) {
    return null;
  }

  return (
    <MenuItem
      closeMenuOnClick={false}
      onClick={() => toggleAutoSync(!enableGoogleSync)}
      leftSection={<SvgElement content="google" width={24} height={24} />}
      disabled={isDisabled}
      rightSection={
        <Switch
          className={styles.autoSyncSwitch}
          disabled={isDisabled}
          checked={enableGoogleSync}
          {...getLuminDataAttributes()}
        />
      }
    >
      Auto-sync
    </MenuItem>
  );
};

AutoSync.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  setCurrentDocument: PropTypes.func.isRequired,
  isLoadingDocument: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentDocument: (document) => dispatch(actions.setCurrentDocument(document)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoSync);
