import { connect } from 'react-redux';
import {
  mergeExternalWebViewerDocument,
  mergeDocument,
} from 'helpers/pageManipulation';
import selectors from 'selectors';
import actions from 'actions';
import ThumbnailsPanel from './ThumbnailsPanel';

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  setSelectedPageThumbnails: (pages) => dispatch(actions.setSelectedPageThumbnails(pages)),
  showWarningMessage: (warning) => dispatch(actions.showWarningMessage(warning)),
  mergeDocument: (file, mergeToPage) => dispatch(mergeDocument(file, mergeToPage)),
  mergeExternalWebViewerDocument: (viewerID, mergeToPage) => dispatch(mergeExternalWebViewerDocument(viewerID, mergeToPage)),
});

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'thumbnailsPanel'),
  totalPages: selectors.getTotalPages(state),
  currentPage: selectors.getCurrentPage(state),
  selectedPageIndexes: selectors.getSelectedThumbnailPageIndexes(state),
  isThumbnailMergingEnabled: selectors.getIsThumbnailMergingEnabled(state),
  isThumbnailReorderingEnabled: selectors.getIsThumbnailReorderingEnabled(
    state,
  ),
  isMultipleViewerMerging: selectors.getIsMultipleViewerMerging(state),
});
export default connect(mapStateToProps, mapDispatchToProps)(ThumbnailsPanel);
