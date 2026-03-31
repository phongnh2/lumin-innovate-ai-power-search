import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import DataElements from 'constants/dataElement';

import AnnotationContentOverlay from './AnnotationContentOverlay';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isDisabled: selectors.isElementDisabled(state, DataElements.ANNOTATION_CONTENT_OVERLAY),
  isOverlayOpen: selectors.isElementOpen(state, DataElements.ANNOTATION_CONTENT_OVERLAY),
  // Clients have the option to customize how the tooltip is rendered
  // by passing a handler
  isUsingCustomHandler: selectors.getAnnotationContentOverlayHandler(state) !== null,
  commentLayout: selectors.getCommentPanelLayoutState(state),
  isInReadAloudMode: readAloudSelectors.isInReadAloudMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
});

const mapDispatchToProps = {
  openOverlay: () => actions.openElement(DataElements.ANNOTATION_CONTENT_OVERLAY),
  closeOverlay: () => actions.closeElement(DataElements.ANNOTATION_CONTENT_OVERLAY),
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(AnnotationContentOverlay);
