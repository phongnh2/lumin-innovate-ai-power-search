import { socket } from 'src/socket';

import actions from 'actions';
import selectors from 'selectors';

import { kratosService } from 'services/oryServices';

import i18n from 'helpers/i18n';

import { LocalStorageUtils } from 'utils';
import googleDriveEvent from 'utils/Factory/EventCollection/GoogleDriveEventCollection';

import { ModalTypes } from 'constants/lumin-common';
import { SOCKET_ON } from 'constants/socketConstant';

import { store } from '../../../redux/store';

class AppSocketService {
  constructor() {
    this.socket = socket;
  }

  subscribe() {
    this.forceLogoutListener();
    this.reactiveAccountListener();
    this.logoutListener();
  }

  unsubscribe() {
    this.socket.removeListener({ message: SOCKET_ON.FORCE_LOGOUT });
    this.socket.removeListener({ message: SOCKET_ON.DELETE_USER_ACCOUNT });
    this.socket.removeListener({ message: SOCKET_ON.REACTIVE_USER_ACCOUNT });
    this.socket.removeListener({ message: SOCKET_ON.USER_LOGOUT });
  }

  forceLogoutListener() {
    this.socket.on(SOCKET_ON.FORCE_LOGOUT, (data) => {
      const state = store.getState();
      const { dispatch } = store;
      const forceLogoutModal = {
        type: ModalTypes.WARNING,
        title: i18n.t('authenPage.sessionExpired'),
        message: i18n.t('authenPage.pleaseTryLoggingInAgain'),
        confirmButtonTitle: i18n.t('common.ok'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: () => {
          googleDriveEvent.totalPopupInSession();
          LocalStorageUtils.clear();
          window.location.href = '/authentication/signin';
        },
      };
      if (selectors.getCurrentUser(state)?._id === data) {
        dispatch(actions.openModal(forceLogoutModal));
      }
    });
  }

  reactiveAccountListener() {
    this.socket.on(SOCKET_ON.REACTIVE_USER_ACCOUNT, (data) => {
      const { dispatch } = store;
      dispatch(actions.updateCurrentUser(data.user));
    });
  }

  logoutListener() {
    this.socket.on(SOCKET_ON.USER_LOGOUT, () => {
      const { dispatch } = store;
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: i18n.t('modalSessionExpired.title'),
        message: i18n.t('modalSessionExpired.message'),
        confirmButtonTitle: i18n.t('common.signIn').replace(/\bIn\b/, 'in'),
        cancelButtonTitle: '',
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
        onConfirm: () => {
          LocalStorageUtils.clear();
          kratosService.signIn(true);
        },
      };
      dispatch(actions.openModal(modalSetting));
    });
  }
}

const appSocketService = new AppSocketService();

export default appSocketService;
