import { connect } from 'react-redux';
import selectors from 'selectors';
import OrganizationTeamHeader from './OrganizationTeamHeader';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(OrganizationTeamHeader);
