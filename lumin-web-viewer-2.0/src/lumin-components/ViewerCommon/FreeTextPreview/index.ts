import { connect } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import DataElements from 'constants/dataElement';

import FreeTextPreview from './FreeTextPreview';

const mapStateToProps = (state: RootState) => ({
  activeToolName: selectors.getActiveToolName(state) as string,
  activeToolStyle: selectors.getActiveToolStyles(state),
  isAnnotationPopup: selectors.isElementOpen(state, DataElements.ANNOTATION_POPUP),
  isElementOpen: selectors.isElementOpen(state, DataElements.FREETEXT_PREVIEW),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(FreeTextPreview);
