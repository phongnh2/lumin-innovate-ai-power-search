import { connect } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch, RootState } from 'store';

import { ShowValues } from 'constants/sortStrategies';

import LuminCommentBox from './LuminCommentBox';
import { LuminCommentDefaultStateProps, DefaultDispatchProps } from './types';

const mapStateToProps = (
  state: RootState,
  { annotation }: { annotation: Core.Annotations.Annotation }
): LuminCommentDefaultStateProps => ({
  notePosition: selectors.getCommentPos(state, annotation.Id),
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
  isEdited: selectors.getIsNoteEditing(state),
  noteEditingAnnotationId: selectors.getNoteEditingAnnotationId(state),
  sortStrategy: selectors.getSortStrategy(state),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  isMyNoteToExport: selectors.getShowNotesOption(state) === ShowValues.EXPORT_MY_NOTES,
});

const mapDispatchToProps = (dispatch: AppDispatch): DefaultDispatchProps => ({
  finishNoteEditing: () => dispatch(actions.finishNoteEditing() as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminCommentBox);
