/* eslint-disable @typescript-eslint/no-unsafe-call */
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import IntegrateLuminModal from './IntegrateLuminModal';

const mapStateToProps = (state: any): { isOpenLuminSignModal: boolean } => ({
  isOpenLuminSignModal: selectors.getIsOpenSignModal(state),
});

const mapDispatchToProps = (
  dispatch: any
): {
  closeIntegrateModal: (modalName: string) => void;
  openIntegrateModal: (modalName: string) => void;
} => ({
  closeIntegrateModal: (modalName: string): void => dispatch(actions.setShowIntegrateLuminSignModal(modalName)) as void,
  openIntegrateModal: (modalName: string): void =>
    dispatch(actions.setShowIntegrateLuminSignModal(modalName, true)) as void,
});

export default connect(mapStateToProps, mapDispatchToProps)(IntegrateLuminModal);
