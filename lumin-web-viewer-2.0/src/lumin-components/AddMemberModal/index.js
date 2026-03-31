import { compose } from 'redux';
import { withApollo } from '@apollo/client/react/hoc';
import selectors from 'selectors';
import actions from 'actions';
import { connect } from 'react-redux';
import AddMemberModal from './AddMemberModal';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateTeamById: (id, team) => dispatch(actions.updateTeamById(id, team)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
)(AddMemberModal);
