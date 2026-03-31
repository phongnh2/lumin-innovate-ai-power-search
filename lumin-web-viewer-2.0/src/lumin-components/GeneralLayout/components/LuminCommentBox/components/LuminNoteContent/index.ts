import { connect } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch } from 'store';

import DataElements from 'constants/dataElement';
import { mapAnnotationToKey } from 'constants/map';

import LuminNoteContent from './LuminNoteContent';
import { LuminNoteContentDefaultProps, LuminNoteContentDefaultDispatchProps } from './types';

const mapStateToProps = (
  state: any,
  { annotation }: { annotation: Core.Annotations.Annotation }
): LuminNoteContentDefaultProps => ({
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
  noteDateFormat: selectors.getNoteDateFormat(state),
  iconColor: selectors.getIconColor(state, mapAnnotationToKey(annotation)),
});

const mapDispatchToProps = (dispatch: AppDispatch): LuminNoteContentDefaultDispatchProps => ({
  openSignInModal: () => dispatch(actions.openElement(DataElements.USE_COMMENT_MODAL) as AnyAction),
  openViewerModal: (props: object) => dispatch(actions.openViewerModal(props) as AnyAction),
  closeViewerModal: () => dispatch(actions.closeModal() as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminNoteContent);
