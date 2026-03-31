import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import {
  connect,
} from 'react-redux';

import selectors from 'selectors';

import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';

import { Handler, cachingFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { THEME_MODE, ModalTypes } from 'constants/lumin-common';
import { OFFLINE_STORAGE_ACTION, OFFLINE_STATUS } from 'constants/offlineConstant';
import { Colors } from 'constants/styles';

import * as Styled from './OfflineUpdateButton.styled';

function OfflineUpdateButton({
  isOffline, themeMode,
}) {
  const { t } = useTranslation();
  const [shouldManualUpdate, setManualUpdate] = useState(false);
  const { isViewer } = useViewerMatch();
  const theme = isViewer ? themeMode : THEME_MODE.LIGHT;

  const _messageHandler = ({ process }) => {
    if (process.success) {
      if (process.action === OFFLINE_STORAGE_ACTION.SOURCE_UPDATE && process.status) {
        if (process.status === OFFLINE_STATUS.DOWNLOADING) {
          setManualUpdate(false);
        } else {
          setManualUpdate(process.status !== OFFLINE_STATUS.OK);
        }
      } else if (cachingFileHandler.isCleanSourceSuccess(process)) {
        setManualUpdate(false);
      }
    }
  };

  useEffect(() => {
    if (Handler.isOfflineEnabled) {
      cachingFileHandler.shouldManualUpdate().then(setManualUpdate);
      cachingFileHandler.subServiceWorkerHandler(_messageHandler);
      return () => cachingFileHandler.unSubServiceWorkerHandler(_messageHandler);
    }
  }, []);

  const onUpdate = () => {
    setManualUpdate(false);
    toastUtils.openToastMulti({
      type: ModalTypes.INFO,
      message: t('offlineUpgradeButton.installingUpdates'),
    });
    storageHandler.updateSource({ manualUpdate: true });
  };

  return shouldManualUpdate ? (
    <Styled.ButtonWrapper
      isOffline={isOffline}
      onClick={onUpdate}
      $isViewer={isViewer}
      data-lumin-btn-name={ButtonName.UPDATE_OFFLINE_SOURCE_IN_NAV}
    >
      <Tooltip title={t('offlineUpgradeButton.tooltip')}>
        <Icomoon
          className="update-source"
          size={20}
          color={theme === THEME_MODE.LIGHT ? Colors.NEUTRAL_60 : Colors.NEUTRAL_40}
        />
      </Tooltip>
      <Styled.RedDot $isViewer={isViewer} />
    </Styled.ButtonWrapper>
  ) : null;
}

OfflineUpdateButton.propTypes = {
  isOffline: PropTypes.bool,
  themeMode: PropTypes.string,
};

OfflineUpdateButton.defaultProps = {
  isOffline: false,
  themeMode: THEME_MODE.LIGHT,
};

const mapStateToProps = (state) => ({
  isOffline: selectors.isOffline(state),
  themeMode: selectors.getThemeMode(state),
});

export default connect(mapStateToProps)(OfflineUpdateButton);
