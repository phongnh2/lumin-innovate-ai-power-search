import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import ZoomButton from './ZoomButton';

const mapStateToProps = (state) => ({
  zoomRatio: selectors.getZoom(state),
  isActiveEditMode: selectors.getIsActiveEditMode(state),
});

const mapDispatchToProps = () => ({
  setDeactiveEditMode: actions.setDeactiveEditMode,
});

export default connect(mapStateToProps, mapDispatchToProps)(ZoomButton);
