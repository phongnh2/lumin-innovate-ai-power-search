import { withApollo } from '@apollo/client/react/hoc';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import TeamTransferModal from './TeamTransferModal';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openErrorModal: () => dispatch(actions.openErrorModal()),
  removeTeamById: (teamId) => dispatch(actions.removeTeamById(teamId)),
});
export default compose(withApollo, withRouter, connect(mapStateToProps, mapDispatchToProps))(TeamTransferModal);
