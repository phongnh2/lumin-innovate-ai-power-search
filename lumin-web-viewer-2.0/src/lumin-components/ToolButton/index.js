import { connect } from 'react-redux';

import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import ToolButton from './ToolButton';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(withRouter(ToolButton));
