import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect, shallowEqual } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import Button from 'luminComponents/Button';
import Element from 'luminComponents/Element';
import ButtonMaterial from 'luminComponents/ViewerCommon/ButtonMaterial';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils';

import DataElement from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import toolsName from 'constants/toolsName';

import './LeftPanelTabs.scss';

class LeftPanelTabs extends React.Component {
  clickEventQueue = [];

  componentDidUpdate(prevProps) {
    if (this.props.isFormBuildPanelOpen !== prevProps.isFormBuildPanelOpen && this.clickEventQueue.length > 0) {
      this.clickEventQueue.forEach((item) => item());
      this.clickEventQueue = [];
    }
  }

  isActive = (panel) => this.props.activePanel === panel;

  onClickButtonItem = (className, eventName) => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: eventName,
    });
    const { isLeftPanelOpen, openElement, closeElement, setActiveLeftPanel, t } = this.props;
    if (this.isActive(className) && isLeftPanelOpen) {
      const closePanel = () => {
        closeElement('leftPanel');
        setActiveLeftPanel('');
      };
      const shouldStopEvent =
        toggleFormFieldCreationMode() ||
        promptUserChangeToolMode({ callback: closePanel, applyForTool: toolsName.REDACTION, translator: t });
      if (shouldStopEvent) {
        return;
      }
      closePanel();
    } else {
      const openLeftPanel = () => {
        if (!isLeftPanelOpen) {
          openElement('leftPanel');
        }
        setActiveLeftPanel(className);
      };
      const shouldStopEvent =
        toggleFormFieldCreationMode() ||
        promptUserChangeToolMode({ callback: openLeftPanel, applyForTool: toolsName.REDACTION, translator: t });
      if (shouldStopEvent) {
        this.clickEventQueue.push(() => this.onClickButtonItem(className));
        return;
      }
      openLeftPanel();
    }
  };

  render() {
    const {
      customPanels,
      isLeftPanelTabsDisabled,
      setActiveLeftPanel,
      isLeftPanelOpen,
      isShowTopBar,
      currentDocument,
      isLoadingDocument,
      isShowBannerAds,
      isShowToolbarTablet,
      showWarningBanner,
      isInContentEditMode,
    } = this.props;

    if (isLeftPanelTabsDisabled) {
      return null;
    }

    const buttonItems = [
      {
        className: DataElement.THUMBNAILS_PANEL,
        dataElement: 'thumbnailsPanelButton',
        icon: 'thumbnail',
        title: 'component.thumbnailsPanel',
        eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.THUMBNAILS,
      },
      {
        className: DataElement.OUTLINES_PANEL,
        dataElement: 'outlinesPanelButton',
        icon: 'list',
        title: 'component.outlinesPanel',
        eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.OUTLINES,
      },
      {
        className: DataElement.NOTES_PANEL,
        dataElement: 'notesPanelButton',
        icon: 'note',
        title: 'component.notesPanel',
        eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.ADD_NOTE,
      },
      {
        className: DataElement.BOOKMARKS_PANEL,
        dataElement: 'bookmarksPanelButton',
        icon: 'bookmark-alt',
        title: 'component.bookmarksPanel',
        eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.BOOKMARKS,
      },
      {
        className: DataElement.FILE_INFO_PANEL,
        dataElement: DataElement.FILE_INFO_PANEL_BUTTON,
        icon: 'file-info',
        title: 'viewer.leftPanelTabs.fileInfo',
        eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.FILE_INFO,
      },
    ];

    const isPreventUserAction = currentDocument.isOverTimeLimit || isLoadingDocument;
    const leftPanelTabsClasses = {
      'has-warning-banner': showWarningBanner,
      'has-top-bar': isShowTopBar,
      'has-toolbar': isShowToolbarTablet,
      'has-banner': isShowBannerAds,
      'is-in-content-edit-mode': isInContentEditMode,
    };

    return (
      <>
        {isPreventUserAction && (
          <div
            className={classnames('LeftPanelTabs__overlay', leftPanelTabsClasses)}
          />
        )}
        <Element
          className={classnames('LeftPanelTabs', leftPanelTabsClasses)}
          dataElement="leftPanelTabs"
        >
          <div className="joyride-viewer-left-panel">
            {buttonItems.map((item, idx) => (
              <ButtonMaterial
                key={idx}
                className={classnames({
                  active: this.isActive(item.className) && isLeftPanelOpen,
                })}
                dataElement={item.dataElement}
                icon={item.icon}
                onClick={() => this.onClickButtonItem(item.className, item.eventTrackingName)}
                title={item.title}
                location="right"
              />
            ))}
          </div>
          {customPanels.map(({ panel, tab }, index) => (
            <Button
              key={tab.dataElement || index}
              disabled={!this.isActive(panel.dataElement)}
              dataElement={tab.dataElement}
              img={tab.img}
              onClick={() => setActiveLeftPanel(panel.dataElement)}
            />
          ))}
        </Element>
      </>
    );
  }
}

LeftPanelTabs.propTypes = {
  activePanel: PropTypes.string.isRequired,
  customPanels: PropTypes.array.isRequired,
  isLeftPanelTabsDisabled: PropTypes.bool,
  setActiveLeftPanel: PropTypes.func.isRequired,
  isLeftPanelOpen: PropTypes.bool,
  openElement: PropTypes.func,
  closeElement: PropTypes.func,
  isShowTopBar: PropTypes.bool,
  currentDocument: PropTypes.object,
  isLoadingDocument: PropTypes.bool,
  isShowBannerAds: PropTypes.bool,
  isShowToolbarTablet: PropTypes.bool,
  isFormBuildPanelOpen: PropTypes.bool,
  t: PropTypes.func,
  showWarningBanner: PropTypes.bool,
  isInContentEditMode: PropTypes.bool,
};

LeftPanelTabs.defaultProps = {
  isLeftPanelTabsDisabled: false,
  isLeftPanelOpen: false,
  openElement: () => {},
  closeElement: () => {},
  isShowTopBar: false,
  currentDocument: {},
  isLoadingDocument: false,
  isShowBannerAds: false,
  isShowToolbarTablet: false,
  isFormBuildPanelOpen: false,
  t: () => {},
  showWarningBanner: false,
  isInContentEditMode: false,
};

const mapStateToProps = (state) => ({
  activePanel: selectors.getActiveLeftPanel(state),
  customPanels: selectors.getCustomPanels(state),
  disabledCustomPanelTabs: selectors.getDisabledCustomPanelTabs(state),
  isLeftPanelTabsDisabled: selectors.isElementDisabled(state, 'leftPanelTabs'),
  isLeftPanelOpen: selectors.isElementOpen(state, 'leftPanel'),
  isShowTopBar: selectors.getIsShowTopBar(state),
  isShowBannerAds: selectors.getIsShowBannerAds(state),
  isShowToolbarTablet: selectors.getIsShowToolbarTablet(state),
  isFormBuildPanelOpen: selectors.isElementOpen(state, DataElement.FORM_BUILD_PANEL),
  isInContentEditMode: selectors.isInContentEditMode(state),
});

const mapDispatchToProps = {
  setActiveLeftPanel: actions.setActiveLeftPanel,
  openElement: (element) => actions.openElement(element),
  closeElement: (element) => actions.closeElement(element),
};

export default compose(withTranslation() ,connect(mapStateToProps, mapDispatchToProps, null, {
    areStatePropsEqual: (next, prev) =>
      prev.activePanel === next.activePanel &&
      prev.isLeftPanelTabsDisabled === next.isLeftPanelTabsDisabled &&
      prev.isLeftPanelOpen === next.isLeftPanelOpen &&
      prev.isShowTopBar === next.isShowTopBar &&
      prev.isShowBannerAds === next.isShowBannerAds &&
      prev.isShowToolbarTablet === next.isShowToolbarTablet &&
      prev.isFormBuildPanelOpen === next.isFormBuildPanelOpen &&
      prev.showWarningBanner === next.showWarningBanner &&
      prev.isInContentEditMode === next.isInContentEditMode &&
      shallowEqual(prev.customPanels, next.customPanels) &&
      shallowEqual(prev.disabledCustomPanelTabs, next.disabledCustomPanelTabs),
}))(LeftPanelTabs);
