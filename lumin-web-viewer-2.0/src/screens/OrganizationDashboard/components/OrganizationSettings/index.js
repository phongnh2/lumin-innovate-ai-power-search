import { connect } from 'react-redux';
import selectors from 'selectors';
import actions from 'actions';
import OrganizationSettings from './OrganizationSettings';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
  updateCurrentOrganization: (currentOrganization) => dispatch(actions.updateCurrentOrganization(currentOrganization)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationSettings);
