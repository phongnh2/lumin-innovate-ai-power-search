import { connect } from 'react-redux';
import { compose } from 'redux';

import { toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';
import selectors from 'selectors';

import RubberStampItem from './RubberStampItem';

const mapStateToProps = (state) => ({
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
  rubberStamps: selectors.rubberStamps(state),
  isToolbarPopoverVisible: toolbarSelectors.isToolbarPopoverVisible(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  overrideWholeRubberStampList: (dataElement) => dispatch(actions.overrideWholeRubberStampList(dataElement)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(RubberStampItem);
