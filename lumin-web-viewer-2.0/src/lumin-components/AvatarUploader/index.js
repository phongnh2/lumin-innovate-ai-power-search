import { connect } from 'react-redux';
import actions from 'actions';

import AvatarUploader from './AvatarUploader';

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
});

export default connect(null, mapDispatchToProps)(AvatarUploader);
