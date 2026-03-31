import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import actions from 'actions';
import selectors from 'selectors';
import ToolsOverlayLumin from './ToolsOverlayLumin';

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'toolsOverlay'),
  isOpen: selectors.isElementOpen(state, 'toolsOverlay'),
  toolButtonObjects: selectors.getToolButtonObjects(state),
  activeHeaderItems: selectors.getActiveHeaderItems(state),
  activeToolGroup: selectors.getActiveToolGroup(state),
  activeToolStyles: selectors.getActiveToolStyles(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setActiveToolGroup: actions.setActiveToolGroup,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(onClickOutside(ToolsOverlayLumin));
