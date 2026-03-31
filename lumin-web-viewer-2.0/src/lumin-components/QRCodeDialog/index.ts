/* eslint-disable @typescript-eslint/no-unsafe-call */
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import QRCodeDialog from './QRCodeDialog';

const mapStateToProps = (state: RootState): { isOpen: boolean } => ({
  isOpen: selectors.getOpenQRCode(state),
});

const mapDispatchToProps = (dispatch: any): { onClose: () => void } => ({
  onClose: (): void => dispatch(actions.setDisplayQRCodeDialog(false)) as void,
});

export default connect(mapStateToProps, mapDispatchToProps)(QRCodeDialog);
