import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import IntegrateWithLuminButton from './IntegrateWithLuminButton';

const mapStateToProps = (state: any): { currentUser: IUser, currentDocument: IDocumentBase } => ({
  currentUser: selectors.getCurrentUser(state) as IUser,
  currentDocument: selectors.getCurrentDocument(state) as IDocumentBase,
});

const mapDispatchToProps = (dispatch: any): { closeSignaturePopper: () => void } => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  closeSignaturePopper: (): void => dispatch(actions.closeElements(DataElements.SIGNATURE_OVERLAY)) as void,
});

export default connect(mapStateToProps,mapDispatchToProps)(IntegrateWithLuminButton);
