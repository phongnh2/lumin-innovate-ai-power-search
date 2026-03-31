import { connect } from 'react-redux';
import selectors from 'selectors';
import NotificationCommentItem from './NotificationCommentItem';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(NotificationCommentItem);
