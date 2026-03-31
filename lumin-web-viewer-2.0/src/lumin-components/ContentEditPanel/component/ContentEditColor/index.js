import { connect } from 'react-redux';
import selectors from 'selectors';
import ContentEditColor from './ContentEditColor';

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
});

export default connect(mapStateToProps)(ContentEditColor);
