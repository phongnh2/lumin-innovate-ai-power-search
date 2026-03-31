import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import BookmarksPanel from './BookmarksPanel';

const mapDispatchToProps = (dispatch) => ({
  setBookmarks: (optimisticBookmarks) => dispatch(actions.setBookmarks(optimisticBookmarks)),
});

const mapStateToProps = (state) => ({
  bookmarks: selectors.getBookmarks(state),
  isDisabled: selectors.isElementDisabled(state, 'bookmarkPanel'),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(null, { wait: false })(BookmarksPanel));
