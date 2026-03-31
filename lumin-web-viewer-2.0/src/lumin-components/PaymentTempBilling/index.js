import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import PaymentTempBilling from './PaymentTempBilling';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isPurchasing: selectors.getPurchaseState(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
  setPurchaseState: (isPurchasing) => dispatch(actions.setPurchaseState(isPurchasing)),
  updateOrganizationInList: (orgId, data) => dispatch(actions.updateOrganizationInList(orgId, data)),
  updateModalProperties: (data) => dispatch(actions.updateModalProperties(data)),
  setOrganizations: (orgs) => dispatch(actions.setOrganizations(orgs)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(PaymentTempBilling);
