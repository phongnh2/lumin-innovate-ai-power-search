/* eslint-disable no-console */
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import { CommentStyles } from '@new-ui/components/LuminCommentsPanel/constant';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isNotReplyComment } from 'lumin-components/CommentPanel/helper';
import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import CustomElement from 'luminComponents/CustomElement';
import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper/MaterialPopper';

import { useTranslation } from 'hooks';

import { isTabletOrMobile, isIE11 } from 'helpers/device';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import DataElements from 'constants/dataElement';
import { Colors } from 'constants/lumin-common';

import './RightPanelLumin.scss';
import * as Styled from './RightPanelLumin.styled';

const CommentNotesPanel = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/CommentNotesPanel'));

const propTypes = {
  showWarningBanner: PropTypes.bool,
};

const defaultProps = {
  showWarningBanner: false,
};

const COMMENT_SORT_VALUES = {
  POSITION: 'position',
  CREATED_DATE: 'createdDate',
};

const getNoteSortOptions = (t) => [
  { label: t('viewer.rightPanel.position'), value: COMMENT_SORT_VALUES.POSITION },
  { label: t('viewer.rightPanel.createdDate'), value: COMMENT_SORT_VALUES.CREATED_DATE },
];

const RightPanelLumin = ({ showWarningBanner }) => {
  const [
    isDisabled,
    isOpen,
    customPanels,
    leftPanelWidth,
    isShowTopBar,
    isShowBannerAds,
    isShowToolbarTablet,
    isOpenRightToolPanel,
    themeMode,
  ] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, DataElements.RIGHT_PANEL),
      selectors.isElementOpen(state, DataElements.RIGHT_PANEL),
      selectors.getCustomPanels(state),
      selectors.getLeftPanelWidth(state),
      selectors.getIsShowTopBar(state),
      selectors.getIsShowBannerAds(state),
      selectors.getIsShowToolbarTablet(state),
      selectors.isElementOpen(state, DataElements.RIGHT_TOOL_PANEL),
      selectors.getThemeMode(state),
    ],
    shallowEqual
  );
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const noteSortOptions = getNoteSortOptions(t);
  const [selectedOption, setSelectedOption] = useState(noteSortOptions[0]);
  const [showFilterPopper, setShowFilterPopper] = useState(false);
  const filterRef = useRef();
  const activePanel = 'notesPanel';

  const themeProvider = Styled.Theme[themeMode];

  const formatTitlePanel = () => {
    const total = core.getAnnotationsList().filter((annot) => isNotReplyComment(annot) && annot.getContents()).length;
    return `${total} ${total !== 1 ? t('common.comment') : t('common.comments')}`;
  };

  useEffect(() => {
    if (isOpen && isTabletOrMobile()) {
      dispatch(actions.closeElement('searchPanel'));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    dispatch(actions.setSortStrategy(selectedOption.value));
  }, [dispatch, selectedOption]);

  const getDisplay = (panel) => (panel === activePanel ? 'flex' : 'none');
  const style = isIE11 && leftPanelWidth ? { width: leftPanelWidth } : {};

  const onClickCloseListComment = () => {
    dispatch(actions.closeElement('rightPanel'));
    const isHasNotes = window.document.getElementById(CommentStyles.PANEL_SCROLL_ID).hasChildNodes();
    if (isHasNotes) {
      dispatch(actions.openElement('rightPanelComment'));
    }
  };

  return isDisabled ? null : (
    <div
      className={classNames({
        Panel: true,
        RightPanelLumin: true,
        open: isOpen,
        closed: !isOpen,
        'has-warning-banner': showWarningBanner,
        'has-top-bar': isShowTopBar,
        'has-toolbar': isShowToolbarTablet,
        'has-banner': isShowBannerAds,
        'is-in-content-edit-mode': isInContentEditMode,
        'comment-list': true,
        'open-right-toolbar': isOpenRightToolPanel,
      })}
      data-element="rightPanel"
      style={style}
    >
      <div
        className={classNames({
          RightPanelLumin__top: true,
        })}
      >
        <p>{formatTitlePanel()}</p>
        <Button icon="cancel" onClick={onClickCloseListComment} iconSize={14} />
      </div>
      <hr className="title-divider" />
      <ThemeProvider theme={themeProvider}>
        <Styled.SortFilterWrapper>
          <Styled.Title>{t('viewer.rightPanel.sortBy')}</Styled.Title>
          {showFilterPopper && (
            <MaterialPopper
              open
              classes={`theme-${themeMode}`}
              anchorEl={filterRef.current}
              handleClose={() => setShowFilterPopper(false)}
              placement="bottom-start"
              parentOverflow="viewport"
              disablePortal={false}
            >
              <Styled.List>
                {noteSortOptions.map((opt) => (
                  <Styled.Item key={opt.value} value={opt.value} onClick={() => setSelectedOption(opt)}>
                    <span>{opt.label}</span>
                    {isEqual(opt, selectedOption) && (
                      <Icomoon className="check" color={Colors.SECONDARY_50} size={12} style={{ marginLeft: 20 }} />
                    )}
                  </Styled.Item>
                ))}
              </Styled.List>
            </MaterialPopper>
          )}
          <Styled.FilterButton onClick={() => setShowFilterPopper(!showFilterPopper)} ref={filterRef}>
            <span>{selectedOption.label}</span>
            <Icomoon className="dropdown" color={Colors.PRIMARY_80} size={8} style={{ marginLeft: 6 }} />
          </Styled.FilterButton>
        </Styled.SortFilterWrapper>
      </ThemeProvider>
      <div className="left-panel-header" />

      <ErrorBoundaryRightPanel>
        <CommentNotesPanel display={isOpen ? 'flex' : 'none'} isRightPanel />
      </ErrorBoundaryRightPanel>
      {customPanels.map(({ panel }, index) => (
        <CustomElement
          key={panel.dataElement || index}
          className={`Panel ${panel.dataElement}`}
          display={getDisplay(panel.dataElement)}
          dataElement={panel.dataElement}
          render={panel.render}
        />
      ))}
    </div>
  );
};

class ErrorBoundaryRightPanel extends React.Component {
  static getDerivedStateFromError(error) {
    console.error(error);
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
ErrorBoundaryRightPanel.propTypes = {
  children: PropTypes.element,
};
ErrorBoundaryRightPanel.defaultProps = {
  children: null,
};

RightPanelLumin.propTypes = propTypes;
RightPanelLumin.defaultProps = defaultProps;
export default RightPanelLumin;
