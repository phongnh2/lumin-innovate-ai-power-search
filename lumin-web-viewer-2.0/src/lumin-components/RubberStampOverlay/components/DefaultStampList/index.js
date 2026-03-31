import { connect } from 'react-redux';
import { compose } from 'redux';

import { toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';

import DefaultStampList from './DefaultStampList';

const mapStateToProps = (state) => ({
  isToolbarPopoverVisible: toolbarSelectors.isToolbarPopoverVisible(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeElements: (dataElement) => dispatch(actions.closeElements(dataElement)),
  setPlacingMultipleRubberStamp: (boolean) => dispatch(actions.setPlacingMultipleRubberStamp(boolean)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(DefaultStampList);
