import PropTypes from 'prop-types';
import React from 'react';

import GeneralLayoutDisconnectedToast from './GeneralLayoutDisconnectedToast';
import useDisconnectToast from './useDisconnectToast';

const propTypes = {
  offlineEnabled: PropTypes.bool,
  currentUser: PropTypes.object,
};

const defaultProps = {
  offlineEnabled: false,
  currentUser: {},
};

const DisconnectToast = ({ currentUser, offlineEnabled = false }) => {
  const { isOffline } = useDisconnectToast({ currentUser, offlineEnabled });

  return isOffline && !offlineEnabled ? <GeneralLayoutDisconnectedToast /> : null;
};

DisconnectToast.propTypes = propTypes;
DisconnectToast.defaultProps = defaultProps;
export default DisconnectToast;