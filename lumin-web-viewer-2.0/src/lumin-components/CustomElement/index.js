import { connect } from 'react-redux';
import selectors from 'selectors';
import CustomElement from './CustomElement';

const mapStateToProps = (state, ownProps) => ({
  isDisabled: selectors.isElementDisabled(state, ownProps.dataElement),
});

export default connect(mapStateToProps)(CustomElement);
