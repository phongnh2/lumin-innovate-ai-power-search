/* eslint-disable import/no-self-import */
/* eslint-disable import/no-cycle */
import {
  ErrorCode, STATUS_CODE,
} from 'constants/lumin-common';
import { organizationServices } from 'services';
import { orgUtil, toastUtils } from 'utils';
import actions from 'actions';
import selectors from 'selectors';
import { store } from 'src/redux/store';

const SCHEDULED_ACTION = {
  OPEN_MODAL: 'openModal',
};

export default class OrganizationErrorSubscriber {
  constructor(organization) {
    this.organization = organization;
    this.scheduled = [];
    this.currentReduxState = {
      modalOpened: selectors.getModalData(store.getState()).open,
    };
    this.unsubscribeRedux = store.subscribe(() => {
      this.currentReduxState.modalOpened = selectors.getModalData(store.getState()).open;
      if (this.scheduled.length) {
        const runningScheduled = this.scheduled;
        this.scheduled = [];
        runningScheduled.forEach(({ action, data }) => {
          if (action === SCHEDULED_ACTION.OPEN_MODAL && !this.currentReduxState.modalOpened) {
            store.dispatch(actions.openModal(data));
          } else {
            this.scheduled.push({ action, data });
          }
        });
      }
    });
  }

  destructor() {
    this.unsubscribeRedux();
  }

  get Id() {
    return this.organization._id;
  }

  exec = ({ errorCode, statusCode }) => {
    if (statusCode === STATUS_CODE.INTERNAL_ERROR || statusCode === STATUS_CODE.UNPROCESSABLE_ENTITY) {
      toastUtils.openUnknownErrorToast();
      return;
    }
    if (errorCode === ErrorCode.Org.SCHEDULED_DELETE) {
      const { userRole, name: orgName, deletedAt } = this.organization;
      const onConfirm = () => organizationServices.reactiveOrganization(this.organization._id);
      const setting = orgUtil.getScheduledDeleteOrgModalSettings({ userRole, orgName, deletedAt }, onConfirm);
      if (this.currentReduxState.modalOpened) {
        this.scheduled.push({ action: SCHEDULED_ACTION.OPEN_MODAL, data: setting });
      } else {
        store.dispatch(actions.openModal(setting));
      }
    }
  }
}
