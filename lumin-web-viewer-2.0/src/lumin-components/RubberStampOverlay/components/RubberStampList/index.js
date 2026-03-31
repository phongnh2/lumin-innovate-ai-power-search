import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import RubberStampList from './RubberStampList';

const mapStateToProps = (state) => ({
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
  shouldFetchMoreRubberStamps: selectors.shouldFetchMoreRubberStamps(state),
  rubberStampsLength: selectors.rubberStampsLength(state),
  shouldFetchOnInit: selectors.shouldFetchOnInit(state),
  rubberStampsTotal: selectors.rubberStampsTotal(state),
});

const mapDispatchToProps = (dispatch) => ({
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  setRubberStamps: (args) => dispatch(actions.setRubberStamps(args)),
  setShouldFetchRubberStampOnInit: (args) => dispatch(actions.setShouldFetchRubberStampOnInit(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RubberStampList);