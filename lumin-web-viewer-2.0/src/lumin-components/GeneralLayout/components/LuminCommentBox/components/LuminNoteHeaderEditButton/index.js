import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';
import { mapAnnotationToKey } from 'constants/map';
import { ShowValues } from 'constants/sortStrategies';

import LuminNoteHeaderEditButton from './LuminNoteHeaderEditButton';

const mapStateToProps = (state, { annotation }) => ({
  isDisabledPopup: selectors.isElementDisabled(state, DataElements.NOTE_POPUP),
  isDisabledEdit: selectors.isElementDisabled(state, DataElements.NOTE_POPUP_EDIT),
  isDisabledDelete: selectors.isElementDisabled(state, DataElements.NOTE_POPUP_DELETE),
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
  noteDateFormat: selectors.getNoteDateFormat(state),
  iconColor: selectors.getIconColor(state, mapAnnotationToKey(annotation)),
  isShowCheckBox: selectors.getShowNotesOption(state) === ShowValues.EXPORT_MY_NOTES,
});

const mapDispatchToProps = (dispatch) => ({
  enableElement: (element) => dispatch(actions.enableElement(element)),
  disableElement: (element) => dispatch(actions.disableElement(element)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminNoteHeaderEditButton);
