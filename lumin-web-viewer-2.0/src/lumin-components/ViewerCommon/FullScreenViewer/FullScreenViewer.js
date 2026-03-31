import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import ViewerButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';

import { eventTracking } from 'utils';

import { toggleFullScreenMode } from 'features/FullScreen/helpers/toggleFullScreenMode';

import UserEventConstants from 'constants/eventConstants';

const FullScreenViewer = () => {
  const isFullScreen = useSelector((state) => selectors.isFullScreen(state));

  const handleClick = () => {
    eventTracking(UserEventConstants.EventType.HEADER_BUTTON, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.FULLSCREEN,
    });
    toggleFullScreenMode();
  };

  return (
    <ViewerButtonLumin
      icon={isFullScreen ? 'full-screen-closed' : 'full-screen'}
      iconSize={16}
      onClick={handleClick}
      isActive={isFullScreen}
      title="viewer.fullScreen"
    />
  );
};

export default FullScreenViewer;
