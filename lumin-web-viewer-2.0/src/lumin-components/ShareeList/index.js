import { connect } from 'react-redux';
import selectors from 'selectors';

import ShareeList from './ShareeList';

const mapStateToProps = state => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(ShareeList);
