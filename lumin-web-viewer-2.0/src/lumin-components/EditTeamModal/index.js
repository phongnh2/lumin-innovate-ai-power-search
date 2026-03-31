import { connect } from 'react-redux';
import actions from 'actions';
import EditTeamModal from './EditTeamModal';

const mapStateToProps = () => ({

});

const mapDispatchToProps = (dispatch) => ({
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditTeamModal);
