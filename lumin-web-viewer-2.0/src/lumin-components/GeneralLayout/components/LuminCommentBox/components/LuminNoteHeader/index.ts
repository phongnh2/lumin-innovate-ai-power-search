import { connect } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch, RootState } from 'store';

import { DataElements } from 'constants/dataElement';
import { mapAnnotationToKey } from 'constants/map';

import LuminNoteHeader from './LuminNoteHeader';
import { DefaultDispatchProps } from './types';

const mapStateToProps = (
  state: RootState,
  { annotation }: { annotation: Core.Annotations.Annotation }
) => ({
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
  noteDateFormat: selectors.getNoteDateFormat(state),
  iconColor: selectors.getIconColor(state, mapAnnotationToKey(annotation)),
  activeToolStyle: selectors.getActiveToolStyles(state),
});

const mapDispatchToProps = (dispatch: AppDispatch): DefaultDispatchProps => ({
  setIsShowDeleteOverlay: () => dispatch(actions.openElement(DataElements.USE_COMMENT_MODAL) as AnyAction),
  openSignInModal: () => dispatch(actions.openElement(DataElements.USE_COMMENT_MODAL) as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminNoteHeader);
