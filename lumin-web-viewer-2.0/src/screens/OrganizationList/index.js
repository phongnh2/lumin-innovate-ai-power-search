import { withApollo } from '@apollo/client/react/hoc';
import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import OrganizationList from './OrganizationList';

const mapStateToProps = (state) => ({
  organizations: selectors.getOrganizationList(state),
});

export default compose(
  connect(mapStateToProps),
  withApollo,
)(OrganizationList);
