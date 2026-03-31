import { connect } from 'react-redux';
import selectors from 'selectors';
import CustomCheckbox from './CustomCheckbox';

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(CustomCheckbox);
