import { connect } from 'react-redux';
import { compose } from 'redux';
import selectors from 'selectors';
import NotificationOrgItem from './NotificationOrgItem';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default compose(
  connect(mapStateToProps),
)(NotificationOrgItem);
