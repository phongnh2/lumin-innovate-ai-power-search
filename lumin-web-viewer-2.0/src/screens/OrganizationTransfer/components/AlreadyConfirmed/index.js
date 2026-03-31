import { connect } from 'react-redux';
import selectors from 'selectors';
import AlreadyConfirmed from './AlreadyConfirmed';

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),

});

export default connect(mapStateToProps)(AlreadyConfirmed);
