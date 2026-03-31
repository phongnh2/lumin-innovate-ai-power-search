import { connect } from 'react-redux';
import selectors from 'selectors';
import actions from 'actions';
import ToggleButtonWithArrow from './ToggleButtonWithArrow';

const mapStateToProps = (state, ownProps) => {
  let isActive = selectors.isElementOpen(state, ownProps.element);
  if (ownProps.dataElement === 'redactionButton') {
    const isToolActive = selectors.getActiveToolName(state);
    isActive = isActive || isToolActive === 'AnnotationCreateRedaction';
  }

  return {
    className: ownProps.className || 'ToggleButtonWithArrow',
    isActive,
    isRightPanelOpen: selectors.isElementOpen(state, 'rightPanel'),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    dispatch(actions.toggleElement(ownProps.element));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToggleButtonWithArrow);
