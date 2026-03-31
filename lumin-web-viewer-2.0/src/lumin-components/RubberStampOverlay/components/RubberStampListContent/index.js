import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import RubberStampListContent from './RubberStampListContent';

const mapStateToProps = (state) => ({
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
  rubberStamps: selectors.rubberStamps(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElements: (args) => dispatch(actions.closeElements(args)),
  setRubberStamps: (args) => dispatch(actions.setRubberStamps(args)),
  overrideWholeRubberStampList: (args) => dispatch(actions.overrideWholeRubberStampList(args)),
  setPlacingMultipleRubberStamp: (boolean) => dispatch(actions.setPlacingMultipleRubberStamp(boolean)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RubberStampListContent);
