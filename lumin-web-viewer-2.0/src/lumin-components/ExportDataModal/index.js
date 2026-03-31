import { connect } from 'react-redux';
import selectors from 'selectors';
import ExportDataModal from './ExportDataModal';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(ExportDataModal);
