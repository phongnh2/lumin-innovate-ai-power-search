import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import CreateTeamModal from './CreateTeamModal';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),

});

const mapDispatchToProps = (dispatch) => ({
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateTeamModal);
