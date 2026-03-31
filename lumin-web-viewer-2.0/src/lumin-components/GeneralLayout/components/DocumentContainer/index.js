import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DocumentContainer from './DocumentContainer';

const mapStateToProps = (state) => ({
  isCommentPanelOpen: selectors.isCommentPanelOpen(state),
  zoom: selectors.getZoom(state),
  displayMode: selectors.getDisplayMode(state),
  isPageEditMode: selectors.isPageEditMode(state),
  pageEditDisplayMode: selectors.pageEditDisplayMode(state),
  allowPageNavigation: selectors.getAllowPageNavigation(state),
  currentUser: selectors.getCurrentUser(state),
  themeMode: selectors.getThemeMode(state),
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  isToolPropertiesOpen: selectors.isToolPropertiesOpen(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isDefaultMode: selectors.isDefaultMode(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
  toolPropertiesValue: selectors.toolPropertiesValue(state),
  isOffline: selectors.isOffline(state),
  isInFocusMode: selectors.isInFocusMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
  closeElements: (dataElements) => dispatch(actions.closeElements(dataElements)),
  setCommentPanelLayoutState: (state) => dispatch(actions.setCommentPanelLayoutState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentContainer);
