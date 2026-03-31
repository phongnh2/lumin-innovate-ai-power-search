import { connect } from 'react-redux';
import { compose } from 'redux';
import { withApollo } from '@apollo/client/react/hoc';
import selectors from 'selectors';
import actions from 'actions';
import TeamMembersRow from './TeamMembersRow';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state).data,
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  updateModalProperties: (modalSettings) => dispatch(actions.updateModalProperties(modalSettings)),
  openErrorModal: () => dispatch(actions.openErrorModal()),

});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
)(TeamMembersRow);
