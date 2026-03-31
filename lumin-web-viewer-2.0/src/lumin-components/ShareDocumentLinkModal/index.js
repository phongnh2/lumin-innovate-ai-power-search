import { connect } from 'react-redux';

import selectors from 'selectors';
import ShareDocumentLinkModal from './ShareDocumentLinkModal';

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
});

export default connect(mapStateToProps)(ShareDocumentLinkModal);
