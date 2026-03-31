import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import OrganizationDashboard from './OrganizationDashboard';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),

});

export default compose(connect(mapStateToProps))(OrganizationDashboard);
