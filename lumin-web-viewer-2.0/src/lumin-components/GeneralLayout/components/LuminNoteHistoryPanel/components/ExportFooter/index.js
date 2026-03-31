import { connect } from 'react-redux';

import selectors from 'selectors';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import { ShowValues } from 'constants/sortStrategies';

import ExportFooter from './ExportFooter';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
  isShowedFooter:
    selectors.getShowNotesOption(state) === ShowValues.EXPORT_MY_NOTES &&
    selectors.isRightPanelOpen(state) &&
    selectors.rightPanelValue(state) === LayoutElements.NOTE_HISTORY,
});

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(ExportFooter);
