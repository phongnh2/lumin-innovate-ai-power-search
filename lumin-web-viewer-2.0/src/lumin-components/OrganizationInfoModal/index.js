import { connect } from 'react-redux';
import selectors from 'selectors';
import OrganizationInfoModal from './OrganizationInfoModal';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(OrganizationInfoModal);
