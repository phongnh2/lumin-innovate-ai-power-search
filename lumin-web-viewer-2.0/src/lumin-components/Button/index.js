import { connect } from 'react-redux';
import selectors from 'selectors';
import Button from './Button';

const mapStateToProps = (state, ownProps) => ({
  isElementDisabled: selectors.isElementDisabled(state, ownProps.dataElement),
});

export default connect(mapStateToProps)(Button);
