import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import LuminCommentsPanel from './LuminCommentsPanel';

const mapStateToProps = (state) => ({
  isPageEditMode: selectors.isPageEditMode(state),
  idealPlacement: selectors.getIdealPlacement(state),
  displayMode: selectors.getDisplayMode(state),
  isDocumentLoaded: selectors.isDocumentLoaded(state),
  isCommentPanelOpen: selectors.isCommentPanelOpen(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state) && selectors.rightPanelValue(state) !== LayoutElements.DEFAULT,
  commentLayout: selectors.getCommentPanelLayoutState(state),
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  totalPages: selectors.getTotalPages(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  setCommentLocations: (location) => dispatch(actions.setCommentBoxPosition(location)),
  selectComment: (commentId) => dispatch(actions.setSelectedComment(commentId)),
});
export default connect(mapStateToProps, mapDispatchToProps)(LuminCommentsPanel);
