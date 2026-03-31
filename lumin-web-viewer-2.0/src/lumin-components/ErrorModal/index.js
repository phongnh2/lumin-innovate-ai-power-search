import actions from 'actions';
import selectors from 'selectors';
import { connect } from 'react-redux';
import ErrorModal from './ErrorModal';

const mapStateToProps = (state) => ({
  message: selectors.getErrorMessage(state),
  isDisabled: selectors.isElementDisabled(state, 'errorModal'),
  isOpen: selectors.isElementOpen(state, 'errorModal'),
});

const mapDispatchToProps = (dispatch) => ({
  showErrorMessage: (errorMessage) => dispatch(actions.showErrorMessage(errorMessage)),
  closeElements: () => dispatch(
    actions.closeElements([
      'signatureModal',
      'printModal',
      'loadingModal',
      'progressModal',
    ]),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal);
