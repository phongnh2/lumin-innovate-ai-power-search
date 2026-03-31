import { connect } from 'react-redux';

import selectors from 'selectors';

import ToolButtonPopper from './ToolButtonPopper';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  themeMode: selectors.getThemeMode(state),
});

export default connect(mapStateToProps)(ToolButtonPopper);
