import { connect } from 'react-redux';

import selectors from 'selectors';

import GeneralLayout from './GeneralLayout';

const mapStateToProps = (state) => ({
    isLoadingDocument: selectors.isLoadingDocument(state),
    isPageEditMode: selectors.isPageEditMode(state),
    currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(GeneralLayout);
