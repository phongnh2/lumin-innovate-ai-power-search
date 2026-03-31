import { connect } from 'react-redux';
import { compose } from 'redux';
import { withApollo } from '@apollo/client/react/hoc';
import selectors from 'selectors';
import actions from '../../redux/actions';
import MemberOrgRow from './MemberOrgRow';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state).data,
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  updateOrganizationInList: (orgId, data) => dispatch(actions.updateOrganizationInList(orgId, data)),
  updateCurrentOrganization: (data) => dispatch(actions.updateCurrentOrganization(data)),
  updateModalProperties: (data) => dispatch(actions.updateModalProperties(data)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
)(MemberOrgRow);
