/* eslint-disable class-methods-use-this */
import i18next from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';

import { store } from 'src/redux/store';

import actions from 'actions';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import SvgElement from 'lumin-components/SvgElement';

import { userServices } from 'services';

import { toastUtils } from 'utils';
import dateUtils from 'utils/date';

import { ErrorIgnoreToast } from 'constants/errorCode';

import * as Styled from './CommonErrorSubscriber.styled';

export default class CommonErrorSubscriber {
  constructor(user) {
    this.user = user;
    this.dispatch = store.dispatch;
  }

  get Id() {
    return this.user._id;
  }

  exec({ errorCode /* statusCode */ }) {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (errorCode.toLowerCase()) {
      case ErrorIgnoreToast.USER_DELETING:
        this.handleUserDeletingError();
        return { stopped: true };

      default:
        return { stopped: false };
    }
  }

  destructor() {

  }

  async reactivateAccount() {
    try {
      this.dispatch(actions.openElement('loadingModal'));
      await userServices.reactiveAccount();
      toastUtils.success({ message: i18next.t('settingGeneral.accountHasBeenReactivated') });
    } finally {
      this.dispatch(actions.closeElement('loadingModal'));
    }
  }

  handleUserDeletingError() {
    const setting = {
      title: i18next.t('modalExpiredDocument.title'),
      customIcon: <SvgElement content="new-warning" className="auto-margin" width={48} alt="modal_image" />,
      confirmButtonTitle: i18next.t('common.reactivate'),
      onCancel: () => {},
      onConfirm: () => this.reactivateAccount(),
      cancelButtonColor: ButtonColor.TERTIARY,
      message: (
        <>
          <Styled.Text>
            <Trans
              i18nKey="viewer.deleteUserWarning.messageDeleteUserWarning"
              values={{ deletedAt: dateUtils.formatDeleteAccountTime(this.user.deletedAt) }}
            />
          </Styled.Text>
          <Styled.Text>
            <Trans i18nKey="modalExpiredDocument.reactivateMessage" />
          </Styled.Text>
        </>
      ),
    };
    this.dispatch(actions.openModal(setting));
  }
}
