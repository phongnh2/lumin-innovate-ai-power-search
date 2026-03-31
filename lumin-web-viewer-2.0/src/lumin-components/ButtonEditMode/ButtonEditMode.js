import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';

import core from 'core';

import ConvertFileModal from 'lumin-components/ConvertFileModal';
import Tooltip from 'lumin-components/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper';
import PopperLimitContent from 'luminComponents/PopperLimitContent';

import { useAutoSync, useAutoSavePageTools } from 'hooks';

import { isSyncableFile } from 'helpers/autoSync';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { documentStorage, PageToolViewMode } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { FEATURE_VALIDATION } from 'constants/lumin-common';

import ViewerContext from '../../screens/Viewer/Context';

import './ButtonEditMode.scss';

const propTypes = {
  changePageEditDisplayMode: PropTypes.func.isRequired,
  isPageEditMode: PropTypes.bool.isRequired,
  hidden: PropTypes.array,
  openPageEditMode: PropTypes.func.isRequired,
  closePageEditMode: PropTypes.func.isRequired,
  currentDocument: PropTypes.object,
  isTablet: PropTypes.bool,
  currentUser: PropTypes.object,
  t: PropTypes.func,
  theme: PropTypes.string,
  closeElements: PropTypes.func,
  openElement: PropTypes.func,
};

const defaultProps = {
  hidden: [],
  currentDocument: {},
  isTablet: false,
  currentUser: {},
  t: () => {},
  theme: '',
  closeElements: () => {},
  openElement: () => {},
};

const ButtonEditMode = (props) => {
  const {
    isPageEditMode,
    hidden,
    currentDocument,
    isTablet,
    closePageEditMode,
    changePageEditDisplayMode,
    currentUser,
    t,
    openPageEditMode,
    closeElements,
    openElement,
    theme,
  } = props;
  const disabled = currentDocument?.isOverTimeLimit;
  const classHidden = hidden.map((item) => `hide-in-${item}`).join(' ');
  const { bookmarkIns } = useContext(ViewerContext);
  const hasClickedCloseButtonRef = useRef(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenSignInModal, setIsOpenSignInModal] = useState(false);
  const canUseAutoSavePageTools = useAutoSavePageTools();
  const buttonRef = useRef(null);

  const closeEditMode = () => {
    if (isPageEditMode) {
      changePageEditDisplayMode(PageToolViewMode.GRID);
    }
    closePageEditMode();
    core.disableReadOnlyMode();
  };

  const { handleSyncFile, isFileContentChanged } = useAutoSync({
    onSyncSuccess: () => {
      closeElements(DataElements.LOADING_MODAL);
      if (hasClickedCloseButtonRef.current) {
        closeEditMode();
        hasClickedCloseButtonRef.current = false;
      }
    },
    onError: () => closeElements(DataElements.LOADING_MODAL),
  });

  const handleOpenPageEditMode = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.PAGE_TOOLS_BUTTON,
    });
    const triggerOpenPageEditMode = () => {
      if (currentDocument.service === documentStorage.google && !canUseAutoSavePageTools) {
        if (isEmpty(currentUser)) {
          setIsOpenSignInModal((prevValue) => !prevValue);
        } else {
          setIsOpenModal(true);
        }
      } else {
        bookmarkIns.prevBookmarks = { ...bookmarkIns.bookmarksUser };
        core.deselectAllAnnotations();
        core.enableReadOnlyMode();
        core.setToolMode(defaultTool);
        openPageEditMode();
      }
    };
    const shouldStopEvent =
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback: triggerOpenPageEditMode, translator: t });
    if (shouldStopEvent) {
      return;
    }
    triggerOpenPageEditMode();
  };

  const handleClickViewerButton = async () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.PAGE_TOOLS_BUTTON,
    });
    if (isFileContentChanged && isSyncableFile(currentDocument)) {
      hasClickedCloseButtonRef.current = true;
      openElement(DataElements.LOADING_MODAL);
      handleSyncFile();
    } else {
      closeEditMode();
    }
  };

  const classGuideTourRender = () => {
    if (isTablet) {
      return 'joyride-viewer-page-tool-tablet';
    }
    return 'joyride-viewer-page-tool';
  };

  const renderSignInPopper = () => (
    <MaterialPopper
      open={isOpenSignInModal}
      classes={`theme-${theme}`}
      parentOverflow="window"
      disablePortal={false}
      anchorEl={buttonRef.current}
    >
      <PopperLimitContent type={FEATURE_VALIDATION.SIGNIN_REQUIRED} currentDocument={currentDocument} />
    </MaterialPopper>
  );

  return (
    <div className={`EditMode__changeBtn ${classHidden}`}>
      <ButtonGroup>
        <Tooltip content={t('viewer.rightPanel.addCommentsAndAnnotations')} additionalClass="tooltip_viewer">
          <Button
            id="viewer-button-viewer"
            className={`ChangeEditMode__btn ${!isPageEditMode ? 'active' : 'inactive'} ${disabled ? 'disabled' : ''}`}
            onClick={handleClickViewerButton}
          >
            <Icomoon className="edit" size={16} />
            <span className="text">{t('viewer.buttonEditMode.viewerTitle')}</span>
          </Button>
        </Tooltip>
        <Tooltip
          content={t('viewer.buttonEditMode.actionsToolTip')}
          additionalClass={`tooltip_edit ${isPageEditMode ? 'active' : ''}`}
        >
          <Button
            id="viewer-button-page-tool"
            className={`ChangeEditMode__btn ${classGuideTourRender()} ${isPageEditMode ? 'active' : 'inactive'} ${
              disabled ? 'disabled' : ''
            }`}
            onClick={handleOpenPageEditMode}
            ref={buttonRef}
          >
            <Icomoon className="edit-viewer" size={20} />
            <span className="text">{t('viewer.zoomButton.pageTools')}</span>
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ConvertFileModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />
      {renderSignInPopper()}
    </div>
  );
};

ButtonEditMode.propTypes = propTypes;
ButtonEditMode.defaultProps = defaultProps;

export default withTranslation()(ButtonEditMode);
