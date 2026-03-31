import { connect } from 'react-redux';
import ConfirmDeleteAccountModal from './ConfirmDeleteAccountModal';

const mapStateToProps = (state) => ({
  deletePassword: state.auth.deletePassword,
});

export default connect(mapStateToProps)(ConfirmDeleteAccountModal);
