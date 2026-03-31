import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import StatefulButton from './StatefulButton';

const mapStateToProps = (state, ownProps) => ({
  isOpen: selectors.isElementOpen(state, ownProps.dataElement),
  openElements: selectors.getOpenElements(state),
  closeElements: actions.closeElements,
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
});

export default connect(mapStateToProps)(withRouter(StatefulButton));
