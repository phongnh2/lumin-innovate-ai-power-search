/* eslint-disable sonarjs/cognitive-complexity */
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ToolButtonPopper from 'lumin-components/ToolButtonPopper';
import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';
import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';
import IconPremium from 'luminComponents/IconPremium';

import withRouter from 'HOC/withRouter';

import { useDocumentTour, useTranslation } from 'hooks';

import { getToolChecker } from 'helpers/getToolPopper';
import hotkeysManager from 'helpers/hotkeysManager';
import logger from 'helpers/logger';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import toolStylesExist from 'helpers/toolStylesExist';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';
import verifyDocumentDigitalSigned from 'helpers/verifyDocumentDigitalSigned';

import { eventTracking } from 'utils';
import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { waitForEditBoxAvailable, startContentEditMode } from 'utils/setupEditBoxesListener';
import { showDigitalSignatureModal } from 'utils/showDigitalSignatureModal';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import UserEventConstants from 'constants/eventConstants';
import { mapToolNameToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import './ToolButton.scss';

const propTypes = {
  toolName: PropTypes.string.isRequired,
  group: PropTypes.string,
  currentDocument: PropTypes.object,
  match: PropTypes.object,
  additionalClass: PropTypes.string,
  arrow: PropTypes.bool,
  dataElement: PropTypes.string,
  eventTrackingName: PropTypes.string,
  permissionRequired: PropTypes.bool,
  premiumRequired: PropTypes.bool,
  currentUser: PropTypes.object,
  wrapperClass: PropTypes.string,
  eventName: PropTypes.string,
};

const defaultProps = {
  currentDocument: {},
  match: {},
  group: '',
  additionalClass: '',
  arrow: false,
  dataElement: '',
  eventTrackingName: '',
  permissionRequired: false,
  premiumRequired: false,
  currentUser: {},
  wrapperClass: '',
  eventName: '',
};

function ToolButton({
  toolName,
  additionalClass,
  arrow,
  dataElement,
  eventTrackingName,
  permissionRequired,
  premiumRequired,
  currentUser,
  currentDocument,
  wrapperClass,
  eventName,
  ...restProps
}) {
  const isActive = useSelector((state) => selectors.getActiveToolName(state) === toolName);
  const isOpenRubberStampOverlay = useSelector((state) =>
    selectors.isElementOpen(state, DataElements.RUBBER_STAMP_OVERLAY)
  );
  const iconColor = useSelector((state) => selectors.getIconColor(state, mapToolNameToKey(toolName)));
  const toolButtonObject = useSelector((state) => selectors.getToolButtonObject(state, toolName));
  const customOverrides = useSelector((state) =>
    selectors.getCustomElementOverrides(state, selectors.getToolButtonDataElement(state, toolName))
  );
  const toolStyles = useSelector((state) => selectors.getActiveToolStyles(state));
  const isToolStylePopupOpen = useSelector((state) => selectors.isElementOpen(state, 'toolStylePopup'));
  const isShowToolbarTablet = useSelector((state) => selectors.getIsShowToolbarTablet(state));
  const isInContentEditMode = useSelector((state) => selectors.isInContentEditMode(state));
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isTourDocument } = useDocumentTour();
  const [openPopper, setOpenPopper] = useState(false);
  const [isActiveTool, setIsActiveTool] = useState(false);

  const { group = '', icon, title, showColor } = toolButtonObject || {};
  const needCheckPermission = (permissionRequired || premiumRequired) && !isTourDocument;

  const togglePopper = () => {
    setOpenPopper(!openPopper);
  };

  const closePopper = () => {
    setOpenPopper(false);
  };

  useEffect(() => {
    if (typeof customOverrides?.disable === 'undefined') {
      return;
    }

    if (customOverrides.disable) {
      hotkeysManager.off(toolName);
    } else {
      hotkeysManager.on(toolName);
    }
  }, [customOverrides, toolName]);

  const toolChecker = getToolChecker({
    toolName,
    currentUser,
    currentDocument,
    translator: t,
  });

  useEffect(() => {
    if (toolName !== TOOLS_NAME.CONTENT_EDIT) {
      setIsActiveTool(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    if (toolName === TOOLS_NAME.RUBBER_STAMP) {
      setIsActiveTool(isOpenRubberStampOverlay);
    }
  }, [isOpenRubberStampOverlay]);

  useEffect(() => {
    const handleContentEditModeStart = () => {
      setIsActiveTool(true);
    };
    const handleContentEditModeEnd = () => {
      setIsActiveTool(false);
    };
    if (toolName === TOOLS_NAME.CONTENT_EDIT) {
      core.addEventListener('contentEditModeStarted', handleContentEditModeStart);
      core.addEventListener('contentEditModeEnded', handleContentEditModeEnd);
    }
    return () => {
      if (toolName === TOOLS_NAME.CONTENT_EDIT) {
        core.removeEventListener('contentEditModeStarted', handleContentEditModeStart);
        core.removeEventListener('contentEditModeEnded', handleContentEditModeEnd);
      }
    };
  }, []);

  const openWarningEditTextModal = () => {
    const changeMode = (newToolName) => {
      core.deselectAllAnnotations();
      dispatch(actions.setActiveToolGroup(group));
      core.setToolMode(newToolName);
      dispatch(actions.closeElement('toolStylePopup', 'searchOverlay', 'viewControlsOverlay'));
    };

    const modalEventData = {
      modalName: ModalName.OPEN_EDIT_PDF_MODE,
      modalPurpose: ModalPurpose[ModalName.OPEN_EDIT_PDF_MODE],
    };

    const onConfirm = ToolSwitchableChecker.createToolSwitchableHandler(async () => {
      dispatch(actions.openElement(DataElements.LOADING_MODAL));
      const isDocumentDigitalSigned = await verifyDocumentDigitalSigned();
      if (isDocumentDigitalSigned) {
        showDigitalSignatureModal();
        return;
      }

      startContentEditMode();
      core.setRotation(window.Core.PageRotation.e_0);
      core.setToolMode(defaultTool);
      core.deselectAllAnnotations();

      waitForEditBoxAvailable();

      batch(() => {
        dispatch(actions.setDiscardContentEdit(false));
        dispatch(actions.setIsShowToolbarTablet(!isShowToolbarTablet));
        dispatch(actions.setIsInContentEditMode(true));
        dispatch(actions.setActiveHeaderGroup('editPDF'));
      });
      if (!currentDocument.isSystemFile) {
        modalEvent.modalConfirmation(modalEventData);
        return;
      }
      try {
        await saveLocalFile();
        modalEvent.modalConfirmation(modalEventData);
      } catch (e) {
        logger.logError({
          reason: 'Cannot Save Local File',
          error: e,
        });
        changeMode(defaultTool);
        modalEvent.modalDismiss(modalEventData);
      }
    });

    onConfirm();
  };

  const handleClick = () => {
    if (eventTrackingName) {
      eventTracking(UserEventConstants.EventType.HEADER_BUTTON, {
        elementName: eventTrackingName,
        elementPurpose: ButtonPurpose[eventTrackingName],
      });
    }

    const setToolMode = () => {
      if (needCheckPermission && !toolChecker.isToolAvailable) {
        togglePopper();
        dispatch(actions.closeElements(['toolsOverlay', 'searchOverlay', 'toolStylePopup', 'viewControlsOverlay']));
        return;
      }
      if (toolName === TOOLS_NAME.RUBBER_STAMP) {
        core.deselectAllAnnotations();
        dispatch(actions.toggleElement(DataElements.RUBBER_STAMP_OVERLAY));
        return;
      }
      if (isActiveTool) {
        const toolNameToggleList = [
          TOOLS_NAME.FREETEXT,
          TOOLS_NAME.SIGNATURE,
          TOOLS_NAME.STICKY,
          TOOLS_NAME.STAMP,
          TOOLS_NAME.ERASER,
        ];
        const toolNameBackToEditToolList = [TOOLS_NAME.HIGHLIGHT, TOOLS_NAME.REDACTION];

        if (toolNameBackToEditToolList.includes(toolName)) {
          core.setToolMode('AnnotationEdit');
          if (isToolStylePopupOpen) {
            dispatch(actions.closeElement('toolStylePopup'));
          }
        }
        if (toolNameToggleList.includes(toolName)) {
          dispatch(actions.toggleElement('toolStylePopup'));
        }
      } else {
        if (toolName === TOOLS_NAME.CONTENT_EDIT) {
          openWarningEditTextModal();
          return;
        }
        core.setToolMode(toolName);
        dispatch(actions.setActiveToolGroup(group));
        dispatch(actions.closeElement('toolStylePopup', 'searchOverlay', 'viewControlsOverlay'));
        if ([TOOLS_NAME.HIGHLIGHT, TOOLS_NAME.ERASER].includes(toolName)) {
          dispatch(actions.toggleElement('toolStylePopup'));
        }
      }
      if (toolName === TOOLS_NAME.RUBBER_STAMP) {
        core.deselectAllAnnotations();
        dispatch(actions.toggleElement(DataElements.RUBBER_STAMP_OVERLAY));
      }
    };

    const shouldStopEvent =
      toggleFormFieldCreationMode() ||
      (!isInContentEditMode && promptUserChangeToolMode({ callback: setToolMode, translator: t }));
    if (shouldStopEvent) {
      return;
    }
    setToolMode();
  };

  let color = isActiveTool ? toolStyles?.[iconColor]?.toHexString?.() : '';

  if (toolName === TOOLS_NAME.REDACTION) {
    color = '';
  }

  const getButtonWrapperClass = () =>
    isEmpty(restProps.hidden) ? '' : restProps.hidden?.map((item) => `hide-in-${item}`).join(' ');

  const shouldShowPremiumIcon = !isLoadingDocument && premiumRequired && toolChecker.shouldShowPremiumIcon;

  const button = (
    <ButtonLumin
      type="button"
      title={title}
      aria-label="tool"
      isActive={isActiveTool}
      className={classNames(`${additionalClass} ToolButton`, {
        'down-arrow': arrow,
        hasStyles: toolStylesExist(toolName),
        'joyride-viewer-eraser': toolName === TOOLS_NAME.ERASER,
        'joyride-viewer-comment': toolName === TOOLS_NAME.STICKY,
      })}
      color={color}
      icon={icon}
      onClick={handleClick}
      dataElement={dataElement}
      showColor={showColor}
      disabled={isLoadingDocument}
      {...restProps}
    />
  );

  return (
    <ToolButtonPopper openPopper={openPopper} closePopper={closePopper} toolName={toolName} eventName={eventName}>
      <div className={classNames('ToolButtonWrapper', wrapperClass, getButtonWrapperClass())}>
        {button}
        {shouldShowPremiumIcon && <IconPremium className="premium-icon" />}
      </div>
    </ToolButtonPopper>
  );
}

ToolButton.propTypes = propTypes;
ToolButton.defaultProps = defaultProps;

export default withRouter(ToolButton);
