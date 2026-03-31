import { connect } from 'react-redux';
import selectors from 'selectors';
import { withApollo } from '@apollo/client/react/hoc';
import actions from 'actions';
import Plan from './Plan';

const mapStateTopProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
});

export default connect(mapStateTopProps, mapDispatchToProps)(withApollo(Plan));
