import { connect } from 'react-redux';
import { compose } from 'redux';
import { withApollo } from '@apollo/client/react/hoc';
import selectors from 'selectors';
import actions from 'actions';
import SettingPreferences from './SettingPreferences';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});
const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
)(SettingPreferences);
