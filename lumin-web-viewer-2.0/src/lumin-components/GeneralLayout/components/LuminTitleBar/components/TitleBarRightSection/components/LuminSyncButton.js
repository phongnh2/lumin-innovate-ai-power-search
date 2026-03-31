import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DropboxSyncButton from '@new-ui/components/DropboxSyncButton';
import ManualSyncBtn from '@new-ui/components/ManualSyncBtn';
import OnedriveSyncButton from '@new-ui/components/OneDriveSyncButton';

import selectors from 'selectors';

import { useViewerMode } from 'hooks/useViewerMode';

import { isOversizeToAutoSync } from 'helpers/autoSync';

import { general } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

const propTypes = {
  currentDocument: PropTypes.object.isRequired,
};

function LuminSyncButton(props) {
  const { currentDocument } = props;
  const { isAnonymousMode } = useViewerMode();

  const isValidToShowManualButton =
    isOversizeToAutoSync(currentDocument.size) || currentDocument.mimeType !== general.PDF;

  if (isAnonymousMode) {
    return null;
  }

  if (currentDocument.service === STORAGE_TYPE.GOOGLE && isValidToShowManualButton) {
    return <ManualSyncBtn />;
  }
  if (currentDocument.service === STORAGE_TYPE.DROPBOX) {
    return <DropboxSyncButton />;
  }
  if (currentDocument.service === STORAGE_TYPE.ONEDRIVE) {
    return <OnedriveSyncButton />;
  }
  return null;
}

const mapStateToProps = (state) => ({
  isOffline: selectors.isOffline(state),
  currentDocument: selectors.getCurrentDocument(state),
});

LuminSyncButton.propTypes = propTypes;

export default connect(mapStateToProps)(LuminSyncButton);
