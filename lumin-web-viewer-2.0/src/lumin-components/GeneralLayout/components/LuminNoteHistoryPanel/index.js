import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import LuminNoteHistoryPanel from './LuminNoteHistoryPanel';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  isAnnotationLoaded: selectors.getAnnotationsLoaded(state),
  sortStrategy: selectors.getSortStrategy(state),
  showNoteOption: selectors.getShowNotesOption(state),
  noteEditingAnnotationId: selectors.getNoteEditingAnnotationId(state),
});

const mapDispatchToProps = (dispatch) => ({
  selectComment: (commentId) => dispatch(actions.setSelectedComment(commentId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminNoteHistoryPanel);
