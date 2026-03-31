import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import RubberStampModalContent from './RubberStampModalContent';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
  rubberStamps: selectors.rubberStamps(state),
  rubberStampsTotal: selectors.rubberStampsTotal(state),

});

const mapDispatchToProps = (dispatch) => ({
  setPlacingMultipleRubberStamp: (args) => dispatch(actions.setPlacingMultipleRubberStamp(args)),
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  overrideWholeRubberStampList: (dataElement) => dispatch(actions.overrideWholeRubberStampList(dataElement)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(RubberStampModalContent);
