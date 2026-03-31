import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';
import { connect, shallowEqual } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import ContextMenuPopup from './ContextMenuPopup';

const mapStateToProps = (state) => ({
  isInContentEditMode: selectors.isInContentEditMode(state),
  isOpen: selectors.isElementOpen(state, 'contextMenuPopup'),
  isDisabled: selectors.isElementDisabled(state, 'contextMenuPopup'),
  popupItems: selectors.getPopupItems(state, 'contextMenuPopup'),
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  disabledElements: selectors.getDisabledElementFromList(state, [
    'stickyToolButton',
    'highlightToolButton',
    'freeHandToolButton',
    'freeTextToolButton',
  ]),
  isInReadAloudMode: readAloudSelectors.isInReadAloudMode(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
  closeElement: (dataElement) => dispatch(actions.closeElement(dataElement)),
  closeElements: (dataElements) => dispatch(actions.closeElements(dataElements)),
});
export default compose(
  connect(mapStateToProps, mapDispatchToProps, null, {
    areStatePropsEqual: (next, prev) =>
      prev.isOpen === next.isOpen &&
      prev.isInContentEditMode === next.isInContentEditMode &&
      prev.isInReadAloudMode === next.isInReadAloudMode &&
      prev.isDisabled === next.isDisabled &&
      shallowEqual(prev.disabledElements, next.disabledElements) &&
      shallowEqual(prev.popupItems, next.popupItems) &&
      shallowEqual(prev.currentDocument, next.currentDocument) &&
      shallowEqual(prev.currentUser, next.currentUser),
  }),
  withTranslation()
)(onClickOutside(ContextMenuPopup));
