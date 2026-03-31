import { MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { toggleFullScreenMode } from 'features/FullScreen/helpers/toggleFullScreenMode';

import UserEventConstants from 'constants/eventConstants';

const FullScreen = ({ isFullScreen }) => {
  const { t } = useTranslation();

  return (
    <MenuItem
      leftSection={<Icomoon className={isFullScreen ? 'md_full_screen_closed' : 'md_full_screen'} size={20} />}
      data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.FULLSCREEN}
      onClick={toggleFullScreenMode}
    >
      {t(isFullScreen ? 'action.exitFullscreen' : 'action.enterFullscreen')}
    </MenuItem>
  );
};

FullScreen.propTypes = {
  isFullScreen: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isFullScreen: selectors.isFullScreen(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FullScreen);
