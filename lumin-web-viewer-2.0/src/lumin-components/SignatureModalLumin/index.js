import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import SignatureModalLumin from './SignatureModalLumin';

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'signatureModal'),
  isOpen: selectors.isElementOpen(state, 'signatureModal'),
  activeToolStyles: selectors.getActiveToolStyles(state),
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  organizations: selectors.getOrganizationList(state),
  isPlacingMultipleSignatures: selectors.isPlacingMultipleSignatures(state),
  signatureWidgetSelected: selectors.signatureWidgetSelected(state),
  signatureStatus: selectors.getUserSignatureStatus(state),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setIsSavingSignature: actions.setIsSavingSignature,
  setPlacingMultipleSignatures: actions.setPlacingMultipleSignatures,
  setSelectedSignature: actions.setSelectedSignature,
  setSignatureWidgetSelected: actions.setSignatureWidgetSelected,
  setIsFetchingSignatures: (isFetching) =>
    actions.setSignatureStatus({
      isFetching,
    }),
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
  withRouter,
)(SignatureModalLumin);
