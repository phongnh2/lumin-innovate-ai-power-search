import { connect } from 'react-redux';

import selectors from 'selectors';
import ShareSettingModal from './ShareSettingModal';

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
});

export default connect(
  mapStateToProps,
)(ShareSettingModal);
