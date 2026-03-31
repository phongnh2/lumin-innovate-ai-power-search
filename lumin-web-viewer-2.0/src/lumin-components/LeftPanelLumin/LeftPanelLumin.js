import classNames from 'classnames';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import CustomElement from 'luminComponents/CustomElement';

import { useTranslation } from 'hooks';

import { isTabletOrMobile, isIE11 } from 'helpers/device';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { DataElements } from 'constants/dataElement';
import { LeftPanelTitles } from 'constants/panelTabs';
import toolsName from 'constants/toolsName';

import './LeftPanelLumin.scss';

const propTypes = {
  showWarningBanner: PropTypes.bool,
};

const defaultProps = {
  showWarningBanner: false,
};

const NotesPanel = lazyWithRetry(() => import('lumin-components/NotesPanel'));
const ThumbnailsPanel = lazyWithRetry(() => import('lumin-components/ThumbnailsPanel'));
const OutlinesPanel = lazyWithRetry(() => import('lumin-components/OutlinesPanel'));
const BookmarksPanel = lazyWithRetry(() => import('lumin-components/BookmarksPanel'));
const FileInfoPanel = lazyWithRetry(() => import('lumin-components/ViewerCommon/FileInfoPanel'));

const LeftPanelLumin = ({ showWarningBanner }) => {
  const [
    isDisabled,
    isOpen,
    activePanel,
    customPanels,
    leftPanelWidth,
    isShowTopBar,
    isShowBannerAds,
    isShowToolbarTablet,
  ] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, 'leftPanel'),
      selectors.isElementOpen(state, 'leftPanel'),
      selectors.getActiveLeftPanel(state),
      selectors.getCustomPanels(state),
      selectors.getLeftPanelWidth(state),
      selectors.getIsShowTopBar(state),
      selectors.getIsShowBannerAds(state),
      selectors.getIsShowToolbarTablet(state),
    ],
    shallowEqual
  );
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const formatTitlePanel = () => {
    if (activePanel === DataElements.FILE_INFO_PANEL) {
      return t('viewer.leftPanelTabs.fileInfo');
    }

    if (Object.keys(LeftPanelTitles).includes(activePanel)) {
      const title = t(LeftPanelTitles[activePanel]);
      return capitalize(title);
    }
    const titlePanel = activePanel.slice(0, activePanel.length - 5);
    return capitalize(titlePanel);
  };

  useEffect(() => {
    if (isOpen && isTabletOrMobile()) {
      dispatch(actions.closeElement('searchPanel'));
    }
  }, [dispatch, isOpen]);

  const getDisplay = (panel) => (panel === activePanel ? 'flex' : 'none');
  const style = isIE11 && leftPanelWidth ? { width: leftPanelWidth } : {};

  const onClickCloseIcon = () => {
    dispatch(actions.closeElement('leftPanel'));
    dispatch(actions.setActiveLeftPanel(''));
  };

  return isDisabled ? null : (
    <div
      className={classNames({
        Panel: true,
        LeftPanelLumin: true,
        open: isOpen,
        closed: !isOpen,
        'has-warning-banner': showWarningBanner,
        'has-top-bar': isShowTopBar,
        'has-toolbar': isShowToolbarTablet,
        'has-banner': isShowBannerAds,
        'is-in-content-edit-mode': isInContentEditMode,
      })}
      data-element="leftPanel"
      style={style}
    >
      <div className="LeftPanelLumin__top">
        <p>{formatTitlePanel()}</p>
        <div className="close_btn_wrapper">
          <Button
            icon="cancel"
            onClick={handlePromptCallback({
              callback: onClickCloseIcon,
              applyForTool: toolsName.REDACTION,
              translator: t,
            })}
            iconSize={14}
          />
        </div>
      </div>
      <div className="LeftPanelLumin__divider" />

      <ErrorBoundary>
        <NotesPanel display={getDisplay('notesPanel')} />
      </ErrorBoundary>
      <ThumbnailsPanel display={getDisplay('thumbnailsPanel')} />
      <OutlinesPanel display={getDisplay('outlinesPanel')} />
      <BookmarksPanel display={getDisplay('bookmarksPanel')} />
      <FileInfoPanel display={getDisplay('fileInfoPanel')} />
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

class ErrorBoundary extends React.Component {
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
ErrorBoundary.propTypes = {
  children: PropTypes.element,
};
ErrorBoundary.defaultProps = {
  children: null,
};

LeftPanelLumin.propTypes = propTypes;
LeftPanelLumin.defaultProps = defaultProps;
export default LeftPanelLumin;
