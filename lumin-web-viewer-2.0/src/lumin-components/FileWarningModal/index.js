import { connect } from 'react-redux';
import actions from 'actions';

import FileWarningModal from './FileWarningModal';

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  updateModalProperties: (modalProperties) => dispatch(actions.updateModalProperties(modalProperties)),
  closeModal: () => dispatch(actions.closeModal()),
});
export default connect(null, mapDispatchToProps)(FileWarningModal);
