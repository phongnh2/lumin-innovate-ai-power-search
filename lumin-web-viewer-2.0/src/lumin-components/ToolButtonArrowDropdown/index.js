import { connect } from 'react-redux';

import selectors from 'selectors';

import ToolButtonArrowDropdown from './ToolButtonArrowDropdown';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(ToolButtonArrowDropdown);
