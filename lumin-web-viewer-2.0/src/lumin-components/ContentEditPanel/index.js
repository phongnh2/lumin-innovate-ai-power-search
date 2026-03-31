import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';

import ContentEditPanel from './ContentEditPanel';

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyle: selectors.getActiveToolStyles(state),
  isOpenContentEditPanel: selectors.isElementOpen(state, DataElements.CONTENT_EDIT_PANEL),
  isShowTopBar: selectors.getIsShowTopBar(state),
  isShowBannerAds: selectors.getIsShowBannerAds(state),
  isShowToolbarTablet: selectors.getIsShowToolbarTablet(state),
  themeMode: selectors.getThemeMode(state),
  isOpenRightToolPanel: selectors.isElementOpen(state, DataElements.RIGHT_TOOL_PANEL),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  closeElements: actions.closeElements,
  disableElements: actions.disableElements,
  enableElements: actions.enableElements,
  setIsInContentEditMode: actions.setIsInContentEditMode,
  setActiveHeaderGroup: actions.setActiveHeaderGroup,
  setIsShowToolbarTablet: actions.setIsShowToolbarTablet,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentEditPanel);
