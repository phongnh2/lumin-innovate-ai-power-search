import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';

import RubberStampOverlay from './RubberStampOverlay';

const mapStateToProps = (state) => ({
  isOpen: selectors.isElementOpen(state, DataElements.RUBBER_STAMP_OVERLAY),
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  setPlacingMultipleRubberStamp: (args) => dispatch(actions.setPlacingMultipleRubberStamp(args)),
  openElement: (dataElement) => dispatch(actions.openElement(dataElement)),
  updateCurrentUser: (data) => dispatch(actions.updateCurrentUser(data)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(RubberStampOverlay);