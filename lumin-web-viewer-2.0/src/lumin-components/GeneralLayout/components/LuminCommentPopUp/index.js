import { connect } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';

import LuminCommentPopUp from './LuminCommentPopUp';

const mapStateToProps = (state) => ({
  isPopupOpen: selectors.isElementOpen(state, DataElements.COMMENT_POPUP),
  isPageEditMode: selectors.isPageEditMode(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state) && selectors.rightPanelValue(state) !== LayoutElements.DEFAULT,
  commentLayout: selectors.getCommentPanelLayoutState(state),
  isInContentEditMode: selectors.isInContentEditMode(state),
  isFormBuildPanelOpen:
    selectors.isToolPropertiesOpen(state) &&
    selectors.toolPropertiesValue(state) === TOOL_PROPERTIES_VALUE.FORM_BUILD_PANEL,
  noteEditingAnnotationId: selectors.getNoteEditingAnnotationId(state),
});
const mapDispatchToProps = (dispatch) => ({
  openPopup: () => dispatch(actions.openElement(DataElements.COMMENT_POPUP)),
  closePopup: () => dispatch(actions.closeElement(DataElements.COMMENT_POPUP)),
  setNoteEditingAnnotationId: (noteEditingAnnotationId) =>
    dispatch(actions.setNoteEditingAnnotationId(noteEditingAnnotationId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminCommentPopUp);
