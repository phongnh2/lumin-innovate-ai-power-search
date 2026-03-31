import i18next from 'i18next';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { kratosService } from 'services/oryServices';

import LocalStorageUtils from 'utils/localStorage';

import { ModalTypes } from 'constants/lumin-common';

declare global {
  interface Window {
    forceOut: boolean;
  }
}

export default (): void => {
  const { t } = i18next;
  const { dispatch } = store;

  dispatch(
    actions.openViewerModal({
      type: ModalTypes.WARNING,
      title: t('viewer.sessionExpireWarning'),
      message: t('viewer.loginToContinueWork'),
      confirmButtonTitle: t('common.signIn').replace(/\bIn\b/, 'in'),
      cancelButtonTitle: '',
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
      onConfirm: () => {
        LocalStorageUtils.clear();
        window.forceOut = true;
        kratosService.signIn(true);
      },
    }) as AnyAction
  );
};
