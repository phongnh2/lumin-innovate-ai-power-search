import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, {
  // useState,
  useEffect,
  useRef,
} from 'react';
import { useSelector, shallowEqual } from 'react-redux';
// import { useMedia } from 'react-use';

import selectors from 'selectors';

import DownloadProgress from 'lumin-components/DownloadProgress';
import Tooltip from 'lumin-components/Shared/Tooltip';
import ActionButton from 'lumin-components/ViewerCommon/ActionButton';

import { Handler, cachingFileHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';

const makeOfflineButton = () => ({
  [DOCUMENT_OFFLINE_STATUS.AVAILABLE]: {
    title: 'viewer.header.makeFileOnlineAvailable',
    icon: 'unavailable-offline',
  },
  [DOCUMENT_OFFLINE_STATUS.UNAVAILABLE]: {
    title: 'viewer.header.makeFileOfflineAvailable',
    icon: 'available-offline',
  },
});

const TIMER_SHOW_POPOVER = 2000;

const EDIT_FILE_OFFLINE_MODAL_DATE = '2023-03-20';

export const isNewUser = (user) => {
  if (!user) {
    return false;
  }
  const userCreatedDate = dayjs(user.createdAt.substr(0, 10));
  return dayjs(EDIT_FILE_OFFLINE_MODAL_DATE).isBefore(userCreatedDate);
};
function OfflineStatus({
  document, onClick, isOffline, isLoadingDocument
}) {
  const { offlineStatus } = document;
  const isAvailableOffline = offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE;
  const isSourceDownloading = useSelector(selectors.isSourceDownloading);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const startPopoverRef = useRef(null);
  const { t } = useTranslation();

  const openPopper = async () => {
    if (currentUser?.metadata.hasShownEditFileOfflinePopover) {
      return;
    }
    const isEnabledMakeOfflineSuggest = localStorage.getItem(LocalStorageKey.ENABLE_MAKE_OFFLINE_SUGGEST);
    if (!isEnabledMakeOfflineSuggest && isNewUser(currentUser)) {
      localStorage.setItem(LocalStorageKey.ENABLE_MAKE_OFFLINE_SUGGEST, true);
    }
  };

  const messageHandler = async ({ process }) => {
    if (cachingFileHandler.isSourceDownloadSuccess(process)) {
      openPopper();
    }
  };

  useEffect(() => {

    const showPopoverEditOffline = async () => {
      const { email: offlineEmail } = await cachingFileHandler.getActiveOfflineUser();
      if ((Handler.isOfflineEnabled || !offlineEmail) && !cachingFileHandler.data.length) {
        startPopoverRef.current = setTimeout(() => {
          openPopper();
        }, TIMER_SHOW_POPOVER);
      }
    };

    if (!isLoadingDocument) {
      showPopoverEditOffline();
    }
  }, [isLoadingDocument]);

  useEffect(() => {
    cachingFileHandler.subServiceWorkerHandler(messageHandler);
    return () => {
      clearTimeout(startPopoverRef.current);
      cachingFileHandler.unSubServiceWorkerHandler(messageHandler);
    };
  }, []);

  if (offlineStatus === DOCUMENT_OFFLINE_STATUS.DOWNLOADING) {
    return (
      <Tooltip
        title={t('viewer.offlineStatus.downloading')}
        PopperProps={{ disablePortal: true }}
        tooltipStyle={{ marginTop: 10, zIndex: 4 }}
        placement="bottom"
      >
        <div style={{ display: 'flex', margin: '0 6px' }}>
          <DownloadProgress size={24} />
        </div>
      </Tooltip>
    );
  }

  return (
    <ActionButton
        {...makeOfflineButton()[offlineStatus || DOCUMENT_OFFLINE_STATUS.UNAVAILABLE]}
        disabled={isOffline || isSourceDownloading}
        iconSize={16}
        aria-label="offline"
        onClick={onClick}
        className="HeaderLumin__offline-button"
        data-lumin-btn-name={isAvailableOffline ?
          ButtonName.MAKE_OFFLINE_FILE_UNAVAILABLE_IN_VIEWER : ButtonName.MAKE_OFFLINE_FILE_IN_VIEWER}
      />
  );
}

OfflineStatus.propTypes = {
  document: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  isOffline: PropTypes.bool,
  isLoadingDocument: PropTypes.bool,
  tabletRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  shouldShowSyncButton: PropTypes.bool
};
OfflineStatus.defaultProps = {
  onClick: () => {},
  isOffline: false,
  isLoadingDocument: true,
  tabletRef: () => {},
  shouldShowSyncButton: false,
};

export default OfflineStatus;
