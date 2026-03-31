import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';

import { LocalStorageKey } from 'constants/localStorageKey';

import * as Styled from './DisconnectToast.styled';

const propTypes = {
  offlineEnabled: PropTypes.bool,
  currentUser: PropTypes.object,
};

const defaultProps = {
  offlineEnabled: false,
  currentUser: {},
};

const useDisconnectToast = ({ currentUser, offlineEnabled = false }) => {
  const [offlineStatus, setOfflineStatus] = useState(null);
  const isOffline = useSelector(selectors.isOffline);
  const { t } = useTranslation();

  const enableOffline = () => {
    localStorage.setItem(LocalStorageKey.SCHEDULE_ENABLE_OFFLINE, true);
    setOfflineStatus({
      message: t('viewer.disconnectToast.setOfflineSuccess'),
      icon: 'success',
      isSuccessStatus: true,
    });
  };

  useEffect(() => {
    const fetchOfflineStatus = async () => {
      const { email: offlineEmail } = await cachingFileHandler.getActiveOfflineUser();
      if (!offlineEmail) {
        setOfflineStatus({
          message: t('viewer.disconnectToast.setOfflineAuto'),
          icon: 'info',
          btn: {
            title: t('viewer.disconnectToast.turnOn'),
            onClick: enableOffline,
          },
        });
        return;
      }

      if (currentUser.email !== offlineEmail) {
        setOfflineStatus({
          message: (
            <Trans i18nKey="viewer.disconnectToast.setOfflineAnotherUser">
              We can't enable offline support for this file right now, because it's enabled for another user
              <Styled.Email>{{ offlineEmail }}</Styled.Email>
            </Trans>
          ),
          icon: 'info',
        });
      }
    };
    /* LMV-3505 Temporary hide offline toast for user using new layout */
    if (isOffline && !offlineEnabled) {
      fetchOfflineStatus();
    }
  }, [isOffline, offlineEnabled]);

  return { isOffline, offlineStatus };
};

useDisconnectToast.propTypes = propTypes;
useDisconnectToast.defaultProps = defaultProps;
export default useDisconnectToast;
