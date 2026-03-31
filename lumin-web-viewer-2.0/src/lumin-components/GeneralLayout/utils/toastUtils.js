import i18next from 'i18next';
import React from 'react';
import { Store as notifications } from 'react-notifications-component';
import v4 from 'uuid/v4';

import Toast from '@new-ui/general-components/Toast';

import array from 'utils/array';

import { ModalTypes } from 'constants/lumin-common';
import { ERROR_MESSAGE_UNKNOWN_ERROR } from 'constants/messages';
// opening toast will return the toast id
// which will be used to remove itself later

let notificationList = [];

const openToastMulti = ({ title, message, type, error, duration = 5000, id, limit, action, onRemoval }) => {
  const currentToastId = id || v4();
  const close = () => notifications.removeNotification(currentToastId);
  if (limit) {
    notificationList.push(currentToastId);
  }
  notifications.addNotification({
    content: <Toast message={message} type={type} title={title} error={error} close={close} action={action} />,
    container: 'top-right',
    animationOut: ['animate__animated', 'animate__zoomOut'],
    slidingExit: {
      duration: 300,
      timingFunction: 'ease-out',
    },
    slidingEnter: {
      duration: 300,
      timingFunction: 'ease-in',
    },
    dismiss: {
      duration,
      pauseOnHover: true,
    },
    id: currentToastId,
    onRemoval: (id, removedBy) => {
      if (limit) {
        const foundIndex = notificationList.findIndex((item) => item === id);
        if (foundIndex !== -1) {
          notificationList = array.removeByIndex(notificationList, foundIndex);
        }
      }
      onRemoval?.(id, removedBy);
    },
    width: 400,
  });

  if (limit && notificationList.length > limit) {
    notifications.removeNotification(notificationList[0]);
    notificationList.shift();
  }
  return close;
};

const neutral = (params) =>
  openToastMulti({
    type: ModalTypes.NEUTRAL,
    ...params,
  });

const success = (params) =>
  openToastMulti({
    type: ModalTypes.SUCCESS,
    ...params,
  });

const info = (params) =>
  openToastMulti({
    type: ModalTypes.INFO,
    ...params,
  });

const warn = (params) =>
  openToastMulti({
    type: ModalTypes.WARNING,
    ...params,
  });

const error = (params) =>
  openToastMulti({
    type: ModalTypes.ERROR,
    ...params,
  });

const openUnknownErrorToast = () =>
  openToastMulti({
    type: ModalTypes.ERROR,
    message: i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR),
  });

const REMOVED_BY = {
  MANUAL: 'manual',
  TIMEOUT: 'timeout',
  CLICK: 'click',
};

export default {
  openToastMulti,
  openUnknownErrorToast,
  success,
  error,
  warn,
  info,
  neutral,
  removeById: (id) => notifications.removeNotification(id),
  REMOVED_BY,
};
