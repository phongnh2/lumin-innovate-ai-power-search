import Element from './Element';
import { connect } from 'react-redux';
import selectors from 'selectors';

const mapStateToProps = (state, ownProps) => ({
  isDisabled: selectors.isElementDisabled(state, ownProps.dataElement),
});

export default connect(mapStateToProps)(Element);
