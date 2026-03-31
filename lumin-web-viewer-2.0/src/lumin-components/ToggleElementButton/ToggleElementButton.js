import classNames from 'classnames';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import core from 'core';

import { isNotReplyComment } from 'lumin-components/CommentPanel/helper';
import IconPremium from 'lumin-components/IconPremium';
import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';
import ToolButtonPopper from 'luminComponents/ToolButtonPopper';

import { useDocumentTour, useThemeMode, useTranslation } from 'hooks';

import { getToolChecker } from 'helpers/getToolPopper';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';

import * as Styled from './ToggleElementButton.styled';

const propTypes = {
  openElement: PropTypes.func.isRequired,
  openElements: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  isRightPanelOpen: PropTypes.bool,
  isActive: PropTypes.bool,
  element: PropTypes.string,
  className: PropTypes.string,
  isFormBuildPanelOpen: PropTypes.bool,
  eventTrackingName: PropTypes.string,
  permissionRequired: PropTypes.bool,
  premiumRequired: PropTypes.bool,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  toolName: PropTypes.string,
  hidden: PropTypes.arrayOf(PropTypes.string),
  isLoadingDocument: PropTypes.bool,
  eventName: PropTypes.string,
};

const defaultProps = {
  isRightPanelOpen: false,
  isActive: false,
  element: '',
  className: '',
  isFormBuildPanelOpen: false,
  eventTrackingName: '',
  permissionRequired: false,
  premiumRequired: false,
  currentUser: {},
  currentDocument: {},
  toolName: '',
  hidden: [],
  isLoadingDocument: false,
  eventName: '',
};

function ToggleElementButton(props) {
  const {
    openElement,
    closeElement,
    closeElements,
    isRightPanelOpen,
    element,
    className,
    isActive,
    isFormBuildPanelOpen,
    permissionRequired,
    premiumRequired,
    currentUser,
    currentDocument,
    toolName,
    hidden,
    isLoadingDocument,
    eventName,
  } = props;
  const themeMode = useThemeMode();
  const { isTourDocument } = useDocumentTour();
  const { t } = useTranslation();

  const [openPopper, setOpenPopper] = useState(false);
  const needCheckPermission = (premiumRequired || permissionRequired) && !isTourDocument;

  const closePopper = useCallback(() => {
    setOpenPopper(false);
  }, []);

  const toolChecker = getToolChecker({
    toolName,
    currentUser,
    currentDocument,
    translator: t,
  });

  const onClickToggleListCommentHistory = () => {
    if (!isRightPanelOpen) {
      openElement('rightPanel');
      closeElements(['rightPanelComment', 'searchPanel', 'searchOverlay']);
    } else {
      closeElements('rightPanel');
      openElement('rightPanelComment');
    }
    const emptyContentAnnot = core
      .getSelectedAnnotations()
      .filter((annot) => isNotReplyComment(annot) && !annot.getContents());
    core.deleteAnnotations(emptyContentAnnot, {});
  };

  const onClickSearchOverlay = () => {
    if (isActive) {
      core.setToolMode(defaultTool);
      closeElement('searchOverlay');
    } else {
      openElement('searchOverlay');
    }
  };

  const onClickFormBuildTool = ToolSwitchableChecker.createToolSwitchableHandler(() => {
    toggleFormFieldCreationMode(DataElements.FORM_BUILD_PANEL);
  });

  const commentHistoryProps = {
    isActive: isRightPanelOpen,
    onClick: onClickToggleListCommentHistory,
    className,
    stopEventChecker: (callback) =>
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback, translator: t }),
  };

  const searchOverlayProps = {
    onClick: onClickSearchOverlay,
    className: classNames(className, {
      SearchButton: true,
    }),
    stopEventChecker: (callback) =>
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback, translator: t }),
  };

  const formBuildProps = {
    isActive: isFormBuildPanelOpen,
    onClick: onClickFormBuildTool,
    className,
    dataElement: DataElements.FORM_BUILD_PANEL,
    stopEventChecker: (callback) => promptUserChangeToolMode({ callback, translator: t }),
  };

  const customOverridesProps = () => {
    switch (element) {
      case DataElements.COMMENT_HISTORY_PANEL:
        return commentHistoryProps;
      case DataElements.SEARCH_OVERLAY:
        return searchOverlayProps;
      case DataElements.FORM_BUILD_PANEL:
        return formBuildProps;
      default:
        return {};
    }
  };

  const newProps = { ...props, ...customOverridesProps() };

  const withStopEventChecker = (callback) => (e) => {
    const shouldStopEvent = newProps.stopEventChecker(() => callback(e));

    if (shouldStopEvent) {
      return;
    }
    callback(e);
  };

  const onClick = withStopEventChecker((e) => {
    if (!needCheckPermission || toolChecker.isToolAvailable) {
      newProps.onClick(e);
      return;
    }
    setOpenPopper((prevState) => !prevState);
  });

  const shouldShowPremiumIcon = !isLoadingDocument && premiumRequired && toolChecker.shouldShowPremiumIcon;

  const getButtonWrapperClass = () => (isEmpty(hidden) ? '' : hidden?.map((item) => `hide-in-${item}`).join(' '));

  return (
    <ThemeProvider theme={Styled.themes[themeMode]}>
      <ToolButtonPopper openPopper={openPopper} closePopper={closePopper} toolName={toolName} eventName={eventName}>
        <Styled.Wrapper className={getButtonWrapperClass()}>
          <ButtonLumin {...newProps} onClick={onClick} iconSize={18} />
          {shouldShowPremiumIcon && <IconPremium className="premium-icon" />}
        </Styled.Wrapper>
      </ToolButtonPopper>
    </ThemeProvider>
  );
}

ToggleElementButton.propTypes = propTypes;
ToggleElementButton.defaultProps = defaultProps;

export default ToggleElementButton;
