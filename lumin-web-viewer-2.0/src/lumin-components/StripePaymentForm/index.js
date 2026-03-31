import { connect } from 'react-redux';
import { compose } from 'redux';
import selectors from 'selectors';
import StripePaymentForm from './StripePaymentForm';

const mapStateToProps = (state) => ({
  isPurchasing: selectors.getPurchaseState(state),
  currentUser: selectors.getCurrentUser(state),
});

export default compose(
  connect(mapStateToProps),
)(StripePaymentForm);
