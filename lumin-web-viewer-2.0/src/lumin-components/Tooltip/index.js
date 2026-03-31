import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import selectors from 'selectors';
import Tooltip from './Tooltip';

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
  zoom: selectors.getZoom(state),
});

export default connect(
  mapStateToProps,
)(withTranslation(null, { wait: false })(Tooltip));
