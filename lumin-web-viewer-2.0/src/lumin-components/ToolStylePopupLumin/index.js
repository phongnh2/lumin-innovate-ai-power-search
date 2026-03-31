import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';

import ToolStylePopupLumin from './ToolStylePopupLumin';

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyle: selectors.getActiveToolStyles(state),
  isDisabled: selectors.isElementDisabled(state, 'toolStylePopup'),
  isOpen: selectors.isElementOpen(state, 'toolStylePopup'),
  activeHeaderItems: selectors.getActiveHeaderItems(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolStylePopupLumin);
