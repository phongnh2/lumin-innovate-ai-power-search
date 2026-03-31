import { Button } from '@mui/material';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import IconPremium from 'lumin-components/IconPremium';
import ToolButtonPopper from 'lumin-components/ToolButtonPopper';
import Tooltip from 'lumin-components/Tooltip';
import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';

import { useDocumentTour, useTranslation } from 'hooks';

import { getToolChecker } from 'helpers/getToolPopper';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { mapToolNameToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import './ToolButtonArrowDropdown.scss';

const propTypes = {
  toolName: PropTypes.string.isRequired,
  group: PropTypes.string,
  currentDocument: PropTypes.object,
  additionalClass: PropTypes.string,
  mediaQueryClassName: PropTypes.string,
  toolTipTitle: PropTypes.string,
  dataElement: PropTypes.string,
  isTablet: PropTypes.bool,
  eventTrackingName: PropTypes.string,
  permissionRequired: PropTypes.bool,
  premiumRequired: PropTypes.bool,
  wrapperClass: PropTypes.string,
};

const defaultProps = {
  currentDocument: {},
  group: '',
  additionalClass: '',
  mediaQueryClassName: '',
  toolTipTitle: '',
  dataElement: '',
  isTablet: false,
  eventTrackingName: '',
  permissionRequired: false,
  premiumRequired: false,
  wrapperClass: undefined,
};

function ToolButtonArrowDropdown({
  toolName,
  additionalClass,
  wrapperClass,
  mediaQueryClassName,
  toolTipTitle,
  dataElement,
  isTablet,
  eventTrackingName,
  permissionRequired,
  premiumRequired,
  ...restProps
}) {
  const isActive = useSelector(selectors.getActiveToolName) === toolName;
  const iconColor = useSelector((state) => selectors.getIconColor(state, mapToolNameToKey(toolName)));
  const toolButtonObject = useSelector((state) => selectors.getToolButtonObject(state, toolName), shallowEqual);
  const toolStyles = useSelector(selectors.getActiveToolStyles);
  const isOpen = useSelector((state) => selectors.isElementOpen(state, 'toolStylePopup'));
  const isOffline = useSelector(selectors.isOffline);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const { isTourDocument } = useDocumentTour();
  const needCheckPermission = (permissionRequired || premiumRequired) && !isTourDocument;

  const [openPopper, setOpenPopper] = useState(false);
  const dispatch = useDispatch();
  const { group = '', icon, title, showColor } = toolButtonObject;
  const { t } = useTranslation();

  const toolChecker = getToolChecker({
    toolName,
    currentDocument,
    currentUser,
    translator: t,
  });

  const togglePopper = () => {
    setOpenPopper(!openPopper);
  };

  const closePopper = () => {
    setOpenPopper(false);
  };

  const withEventTracking = (callback) => () => {
    if (eventTrackingName) {
      eventTracking(UserEventConstants.EventType.CLICK, { elementName: eventTrackingName });
    }
    return callback();
  };

  const withPermissionChecking = (callback) => () => {
    if (needCheckPermission && !toolChecker.isToolAvailable) {
      togglePopper();
      return;
    }
    callback();
  };

  const handleClick = compose(
    withPermissionChecking,
    withEventTracking
  )(() => {
    const setToolMode = () => {
      if (isActive) {
        const toolNameBackToEditToolArray = [TOOLS_NAME.STICKY, TOOLS_NAME.HIGHLIGHT];

        if (toolNameBackToEditToolArray.includes(toolName)) {
          core.setToolMode('AnnotationEdit');
          dispatch(actions.closeElements(['toolStylePopup']));
        }
      } else {
        core.setToolMode(toolName);
        dispatch(actions.setActiveToolGroup(group));
        dispatch(actions.closeElements(['toolsOverlay', 'searchOverlay', 'toolStylePopup', 'viewControlsOverlay']));
      }
    };

    const shouldStopEvent =
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback: setToolMode, translator: t });
    if (shouldStopEvent) {
      return;
    }
    setToolMode();
  });

  const handleOpenStylePalette = compose(
    withPermissionChecking,
    withEventTracking
  )(() => {
    const openStylePalette = () => {
      core.setToolMode(toolName);
      dispatch(actions.setActiveToolGroup(group));
      dispatch(actions.toggleElement('toolStylePopup'));
    };

    const shouldStopEvent =
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback: openStylePalette, translator: t });
    if (shouldStopEvent) {
      return;
    }

    openStylePalette();
  });

  const color = isActive ? toolStyles?.[iconColor]?.toHexString?.() : '';

  const getClassToolButtonArrow = classNames(mediaQueryClassName, wrapperClass, {
    ToolButtonArrowDropdown: true,
    'ToolButtonArrowDropdown--active': isActive,
    [additionalClass]: Boolean(additionalClass),
  });

  const getClassDropdownArrow = classNames({
    ToolButtonArrowDropdown__button: true,
    'ToolButtonArrowDropdown__button--active': isOpen && isActive,
    'disabled--offline': isOffline && isLoadingDocument,
  });
  const tourGuideClassName = `joyride-viewer-comment-group${isTablet ? '-tablet' : ''}`;

  const getButtonWrapperClass = () =>
    isEmpty(restProps.hidden) ? '' : restProps.hidden?.map((item) => `hide-in-${item}`).join(' ');

  return (
    <ToolButtonPopper openPopper={openPopper} closePopper={closePopper} toolName={toolName}>
      <span
        className={classNames(getClassToolButtonArrow, getButtonWrapperClass(), {
          [tourGuideClassName]: toolName === TOOLS_NAME.STICKY,
        })}
      >
        <ButtonLumin
          type="button"
          title={title}
          aria-label="tool"
          isActive={isActive}
          className={classNames('ToolButton', {
            hasStyles: false,
            'joyride-viewer-eraser': toolName === TOOLS_NAME.ERASER,
            'joyride-viewer-comment': toolName === TOOLS_NAME.STICKY,
          })}
          color={color}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={handleClick}
          dataElement={dataElement}
          icon={icon}
          iconSize={18}
          showColor={showColor}
          {...restProps}
        />
        {!isLoadingDocument && premiumRequired && toolChecker.shouldShowPremiumIcon && (
          <IconPremium className="premium-icon" />
        )}
        <Tooltip
          content={restProps?.toolTipContent ? t(restProps.toolTipContent) : ''}
          additionalClass={classNames(`tooltip--${toolTipTitle.trim().toLowerCase().replace(/\s/g, '_')}`, {
            'tooltip--bottom-right': toolTipTitle === 'tool.select',
          })}
        >
          <Button className={getClassDropdownArrow} onClick={handleOpenStylePalette} disabled={isLoadingDocument}>
            <Icomoon className="arrow-down-alt" size={8} />
          </Button>
        </Tooltip>
      </span>
    </ToolButtonPopper>
  );
}

ToolButtonArrowDropdown.propTypes = propTypes;
ToolButtonArrowDropdown.defaultProps = defaultProps;

export default ToolButtonArrowDropdown;
