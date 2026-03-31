import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import EditPanelRotate from './EditPanelRotate';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  thumbs: selectors.getThumbs(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  updateThumbs: (thumbs) => dispatch(actions.updateThumbs(thumbs)),
  setCurrentDocument: (document) => dispatch(actions.setCurrentDocument(document)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditPanelRotate);
