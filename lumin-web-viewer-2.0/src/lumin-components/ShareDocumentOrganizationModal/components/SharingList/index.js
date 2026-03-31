import { connect } from 'react-redux';
import selectors from 'selectors';
import SharingList from './SharingList';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),

});

export default connect(mapStateToProps)(SharingList);
