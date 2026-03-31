import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import OrganizationTransfer from './OrganizationTransfer';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  fetchCurrentOrganization: (organizationUrl) => dispatch(actions.fetchCurrentOrganization(organizationUrl)),
  fetchOrganizations: () => dispatch(actions.fetchOrganizations()),
  updateCurrentOrganization: (data) => dispatch(actions.updateCurrentOrganization(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationTransfer);
