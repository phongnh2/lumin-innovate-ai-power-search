import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';
import WarningModal from './WarningModal';


const mapStateToProps = state => ({
  title: selectors.getWarningTitle(state) ||  '',
  message: selectors.getWarningMessage(state),
  onConfirm: selectors.getWarningConfirmEvent(state),
  confirmBtnText: selectors.getWarningConfirmBtnText(state),
  onCancel: selectors.getWarningCancelEvent(state),
  isDisabled: selectors.isElementDisabled(state, 'warningModal'),
  isOpen: selectors.isElementOpen(state, 'warningModal'),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  closeElements: actions.closeElements
};

export default connect(mapStateToProps, mapDispatchToProps)(WarningModal);
