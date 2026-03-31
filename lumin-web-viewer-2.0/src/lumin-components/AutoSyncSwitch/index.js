import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import AutoSyncSwitch from './AutoSyncSwitch';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  setCurrentDocument: (document) => dispatch(actions.setCurrentDocument(document)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoSyncSwitch);
