import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import AnnotationStylePopup from './AnnotationStylePopup';

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'annotationStylePopup'),
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyle: selectors.getActiveToolStyles(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnnotationStylePopup);
