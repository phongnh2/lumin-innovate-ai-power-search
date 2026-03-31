import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import ToolStylePalette from './ToolStylePalette';

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyle: selectors.getActiveToolStyles(state),
  isOpen: selectors.isElementOpen(state, 'toolStylePopup'),
  buttonObjects: selectors.getToolButtonObjects(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  closeElements: actions.closeElements
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolStylePalette);
