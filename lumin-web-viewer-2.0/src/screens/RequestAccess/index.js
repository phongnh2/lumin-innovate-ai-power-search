import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import RequestAccess from './RequestAccess';

const mapStateTopProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
});
export default connect(mapStateTopProps, mapDispatchToProps)(withRouter(RequestAccess));
