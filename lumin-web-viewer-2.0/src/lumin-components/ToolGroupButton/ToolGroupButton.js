import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import ViewerContext from 'screens/Viewer/Context';

import IconPremium from 'lumin-components/IconPremium';
import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';
import ToolButtonPopper from 'luminComponents/ToolButtonPopper';
import ToolOptionsButton from 'luminComponents/ToolOptionsButton';

import { getToolChecker } from 'helpers/getToolPopper';
import getToolStyles from 'helpers/getToolStyles';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { mapToolNameToKey, getDataWithKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import './ToolGroupButton.scss';

class ToolGroupButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.toolNames = Object.keys(props.toolButtonObjects).filter(
      (toolName) => props.toolButtonObjects[toolName].group === props.toolGroup
    );
    this.state = {
      toolName: this.toolNames[0],
      openPopper: false,
    };
  }

  componentDidUpdate(prevProps) {
    const activeToolNameChanged = prevProps.activeToolName !== this.props.activeToolName;
    const wasActiveToolNameInGroup = this.toolNames.includes(prevProps.activeToolName);
    const isActiveToolNameInGroup = this.toolNames.includes(this.props.activeToolName);

    if (activeToolNameChanged && isActiveToolNameInGroup) {
      this.setState({ toolName: this.props.activeToolName });
    }

    if (!this.toolNames.includes(this.state.toolName)) {
      this.setState({ toolName: this.toolNames[0] });
    }
    if (!wasActiveToolNameInGroup && isActiveToolNameInGroup) {
      this.setState({ toolName: this.props.activeToolName });
      this.props.setActiveToolGroup(this.props.toolGroup);
    }
  }

  needCheckPermission = () => {
    const { permissionRequired, premiumRequired } = this.props;
    return permissionRequired || premiumRequired;
  };

  toolChecker = () => {
    const { currentDocument, currentUser, toolName, t } = this.props;
    return getToolChecker({
      toolName,
      currentUser,
      currentDocument,
      translator: t,
    });
  };

  checkToolPopper = () => {
    const { closeElements } = this.props;
    if (this.needCheckPermission() && !this.toolChecker().isToolAvailable) {
      this.togglePopper();
      closeElements(['toolsOverlay', 'searchOverlay', 'toolStylePopup', 'viewControlsOverlay']);
      return false;
    }
    return true;
  };

  onClickToolButton = (e) => {
    this.handleEventTracking();

    const setToolMode = () => {
      const { toolName } = this.state;
      const { toolGroup, setActiveToolGroup, isActive, isOpen } = this.props;
      e.stopPropagation();
      if (isActive && !isOpen) {
        core.setToolMode('AnnotationEdit');
      } else {
        setActiveToolGroup(toolGroup);
        this.setToolMode(toolName);
      }
    };

    const hasPermission = this.checkToolPopper();
    if (!hasPermission) {
      return;
    }
    const shouldStopEvent =
      toggleFormFieldCreationMode()
      || promptUserChangeToolMode({ callback: setToolMode, translator: this.props.t });
    if (shouldStopEvent) {
      return;
    }
    setToolMode();
  };

  handleEventTracking = () => {
    const { toolGroup, eventTrackingName } = this.props;
    const { toolName } = this.state;

    if (toolGroup === 'highlightTools') {
      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName:
          toolName === TOOLS_NAME.HIGHLIGHT
            ? UserEventConstants.Events.HeaderButtonsEvent.HIGHLIGHT
            : UserEventConstants.Events.HeaderButtonsEvent.FREEHAND_HIGHLIGHT,
      });
    } else if (eventTrackingName) {
        eventTracking(UserEventConstants.EventType.CLICK, { elementName: eventTrackingName });
      }
  };

  onClick = (e) => {
    this.props.eventTrackingName &&
      eventTracking(UserEventConstants.EventType.CLICK, { elementName: this.props.eventTrackingName });

    const hasPermission = this.checkToolPopper();
    if (!hasPermission) {
      return;
    }
    const toggleToolStylePopup = () => {
      e.stopPropagation();
      const { setActiveToolGroup, isActive, closeElement, toggleElement, openElement, toolGroup } = this.props;
      const { toolName } = this.state;
      setActiveToolGroup(toolGroup);
      closeElement('toolStylePopup');
      if (isActive) {
        toggleElement('toolsOverlay');
      } else {
        openElement('toolsOverlay');
        this.setToolMode(toolName);
      }
    };
    const shouldStopEvent =
      toggleFormFieldCreationMode() ||
      promptUserChangeToolMode({
        callback: toggleToolStylePopup,
        translator: this.props.t
      });
    if (shouldStopEvent) {
      return;
    }
    toggleToolStylePopup();
  };

  setToolMode = (toolName) => {
    const { toolGroup } = this.props;

    // This is based on the current design where click on misc tools shouldn't have any tool selected
    if (toolGroup === 'miscTools') {
      core.setToolMode('AnnotationEdit');
    } else {
      core.setToolMode(toolName);
    }
  };

  togglePopper = () => {
    this.setState(({ openPopper }) => ({
      openPopper: !openPopper,
    }));
  };

  closePopper = () => {
    this.setState({ openPopper: false });
  };

  getColor = () => {
    const { isActive, showColor } = this.props;
    const { toolName } = this.state;
    const { iconColor } = getDataWithKey(mapToolNameToKey(toolName));

    let color = '';
    if (showColor === 'always' || (showColor === 'active' && isActive)) {
      const toolStyles = getToolStyles(toolName);
      color = toolStyles?.[iconColor]?.toHexString?.();
    }

    return color;
  };

  getResponsiveClass = () => {
    const { hidden } = this.props;
    return isEmpty(hidden) ? '' : hidden?.map((item) => `hide-in-${item}`).join(' ');
  };

  render() {
    const {
      mediaQueryClassName,
      dataElement,
      toolButtonObjects,
      title,
      isActive,
      additionalClass,
      wrapperClass,
      activeToolName,
      isOpen,
      t,
      isOffline,
      premiumRequired,
      isLoadingDocument
    } = this.props;
    const { toolName, openPopper } = this.state;
    const img = this.props.img || get(toolButtonObjects, '[toolName].img');
    const icon = this.props.icon || toolButtonObjects[toolName]?.icon;
    const toolNameTitle = toolButtonObjects[toolName] && toolButtonObjects[toolName].title;
    // If it's a misc tool group button or customized tool group button we don't want to have the down arrow
    const showDownArrow = !this.props.img;
    const className = [
      'ToolGroupButton',
      (toolName === 'AnnotationCreateFreeHand' && core.getTool(toolName).disabled) ? 'disabled' : '',
      (toolName === activeToolName && isOpen) ? 'has-opened' : '',
    ].join(' ').trim();
    const getClassToolButtonArrow = classNames(
      'ToolButtonGroupArrowDropdown',
      wrapperClass,
      this.getResponsiveClass(),
      {
        'ToolButtonGroupArrowDropdown--active': isActive,
        [additionalClass]: Boolean(additionalClass),
        [mediaQueryClassName]: Boolean(mediaQueryClassName),
      }
    );

    return (
      <ToolButtonPopper openPopper={openPopper} closePopper={this.closePopper} toolName={toolName}>
        <div className={getClassToolButtonArrow}>
          <ButtonLumin
            aria-label="toolGroup"
            className={className}
            isActive={isActive}
            onClick={this.onClickToolButton}
            dataElement={dataElement}
            icon={icon}
            img={img}
            title={toolNameTitle}
            color={this.getColor()}
          />
          {!isLoadingDocument && premiumRequired && this.toolChecker().shouldShowPremiumIcon && (
            <IconPremium className="premium-icon" />
          )}
          {showDownArrow && (
            <ToolOptionsButton
              tooltipContent={title.trim() ? t(title) : ''}
              onClick={this.onClick}
              isActive={isOpen && isActive}
              isOffline={isOffline}
            />
          )}
        </div>
      </ToolButtonPopper>
    );
  }
}

ToolGroupButton.propTypes = {
  activeToolName: PropTypes.string.isRequired,
  toolGroup: PropTypes.string.isRequired,
  mediaQueryClassName: PropTypes.string.isRequired,
  dataElement: PropTypes.string.isRequired,
  img: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  toolButtonObjects: PropTypes.object,
  openElement: PropTypes.func.isRequired,
  toggleElement: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  setActiveToolGroup: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  showColor: PropTypes.string,
  additionalClass: PropTypes.any,
  isOpen: PropTypes.bool,
  closeElements: PropTypes.func,
  currentUser: PropTypes.object,
  t: PropTypes.func.isRequired,
  currentDocument: PropTypes.object,
  eventTrackingName: PropTypes.string,
  isOffline: PropTypes.bool,
  isLoadingDocument: PropTypes.bool,
  permissionRequired: PropTypes.bool,
  premiumRequired: PropTypes.bool,
  toolName: PropTypes.string,
  hidden: PropTypes.arrayOf(PropTypes.string),
  wrapperClass: PropTypes.string,
};

ToolGroupButton.defaultProps = {
  img: '',
  title: 'title',
  icon: '',
  toolButtonObjects: {},
  showColor: '',
  additionalClass: '',
  eventTrackingName: '',
  isOpen: false,
  closeElements: () => {},
  currentUser: {},
  currentDocument: {},
  isLoadingDocument: false,
  isOffline: false,
  permissionRequired: false,
  premiumRequired: false,
  toolName: '',
  hidden: [],
  wrapperClass: undefined,
};

ToolGroupButton.contextType = ViewerContext;

export default ToolGroupButton;
