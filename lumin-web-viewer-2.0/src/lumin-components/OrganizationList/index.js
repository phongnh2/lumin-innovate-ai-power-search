import selectors from 'selectors';
import actions from 'actions';
import { connect } from 'react-redux';
import withTransferTeamsModal from 'src/HOC/withTransferTeamsModal';
import OrganizationList from './OrganizationList';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTransferTeamsModal(OrganizationList));
