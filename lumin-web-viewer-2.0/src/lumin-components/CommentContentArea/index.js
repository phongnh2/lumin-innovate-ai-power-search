import { connect } from 'react-redux';

import selectors from 'selectors';

import CommentContentArea from './CommentContentArea';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  isOffline: selectors.isOffline(state),
});

export default connect(mapStateToProps)(CommentContentArea);
