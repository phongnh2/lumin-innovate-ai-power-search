import { connect } from 'react-redux';

import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import AuthorizeRequest from './AuthorizeRequest';

const mapStateTopProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});
export default connect(mapStateTopProps)(withRouter(AuthorizeRequest));
