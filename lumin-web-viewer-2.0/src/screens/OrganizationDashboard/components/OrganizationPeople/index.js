import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import OrganizationPeople from './OrganizationPeople';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateCurrentOrganization: (data) => dispatch(actions.updateCurrentOrganization(data)),
  updateOrganizationInList: (id, data) => dispatch(actions.updateOrganizationInList(id, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OrganizationPeople));
