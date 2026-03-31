/// <reference path="./toastUtils.d.ts" />
import i18next from 'i18next';
import React from 'react';
import { Store as notifications } from 'react-notifications-component';
import v4 from 'uuid/v4';

import newLayoutToastUtils from 'luminComponents/GeneralLayout/utils/toastUtils';
import ToastMulti from 'luminComponents/ToastMulti';

import fireEvent from 'helpers/fireEvent';

import array from 'utils/array';

import { isEnabledReskin } from 'features/Reskin';

import { ModalTypes } from 'constants/lumin-common';
import { ERROR_MESSAGE_UNKNOWN_ERROR, ERROR_MESSAGE_ORG } from 'constants/messages';

// opening toast will return the toast id
// which will be used to remove itself later

let notificationList = [];

const defaultAnimationInEffect = {
  animationIn: ['fadeIn'],
  slidingEnter: {
    duration: 300,
    timingFunction: 'ease-in-out',
  },
};

const openToastMulti = async ({
  title,
  message,
  type,
  error,
  duration = 5000,
  id,
  limit = 3,
  action,
  onRemoval,
  useReskinToast = true,
  disableAnimationInEffect = false,
  persist = false,
  TransitionProps = {},
}) => {
  /**
   * Temporary solution to use new layout toast
   */
  if (window.location.pathname.includes('/viewer/')) {
    return newLayoutToastUtils.openToastMulti({ title, message, type, error, duration, id, limit, action, onRemoval });
  }
  if (useReskinToast && isEnabledReskin() && !onRemoval) {
    const { enqueueSnackbar } = await import('lumin-ui/kiwi-ui');
    return enqueueSnackbar({
      variant: type,
      message,
      autoHideDuration: duration,
      title,
      actionLabel: action?.label,
      onAction: action?.callback,
      persist,
      id: id || v4(),
      TransitionProps,
    });
  }
  const currentToastId = id || v4();
  const close = () => notifications.removeNotification(currentToastId);
  if (limit) {
    notificationList.push(currentToastId); // add arr list noti for limitation
  }
  notifications.addNotification({
    content: <ToastMulti message={message} type={type} title={title} error={error} close={close} action={action} />,
    container: 'top-right',
    animationOut: ['fadeOut'],
    dismiss: {
      duration,
      pauseOnHover: true,
    },
    slidingExit: {
      duration: 300,
      timingFunction: 'ease-in-out',
    },
    id: currentToastId,
    ...(!disableAnimationInEffect && defaultAnimationInEffect),
    onRemoval: async (id, removedBy) => {
      if (limit) {
        const foundIndex = notificationList.findIndex((item) => item === id);
        if (foundIndex !== -1) {
          notificationList = array.removeByIndex(notificationList, foundIndex);
        }
      }
      if (onRemoval) {
        await onRemoval(id, removedBy);
      }
      fireEvent('toastRemoved', { id, removedBy });
    },
    width: 414,
  });
  if (limit && notificationList.length > limit) {
    notifications.removeNotification(notificationList[0]);
    notificationList.shift();
  }

  return close;
};

const openUnknownErrorToast = (params) =>
  openToastMulti({
    type: ModalTypes.ERROR,
    message: i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR),
    ...params,
  });

const success = (params) =>
  openToastMulti({
    type: ModalTypes.SUCCESS,
    ...params,
  });

const error = (params) =>
  openToastMulti({
    type: ModalTypes.ERROR,
    ...params,
  });

const warn = (params) =>
  openToastMulti({
    type: ModalTypes.WARNING,
    ...params,
  });

const info = (params) =>
  openToastMulti({
    type: ModalTypes.INFO,
    ...params,
  });

const openScimBlockedErrorToast = (params) =>
  openToastMulti({
    type: ModalTypes.ERROR,
    message: i18next.t(ERROR_MESSAGE_ORG.ACTION_BLOCKED_BY_SCIM),
    ...params,
  });

const REMOVED_BY = {
  MANUAL: 'manual',
  TIMEOUT: 'timeout',
  CLICK: 'click',
};

const toastUtils = {
  openToastMulti,
  openUnknownErrorToast,
  success,
  error,
  warn,
  info,
  removeById: (id) => notifications.removeNotification(id),
  waitForToastRemoval: (id) => new Promise((resolve) => {
    if (!notificationList.includes(id)) {
      resolve();
    }
    const onRemoval = (event) => {
      if (event.detail.id === id) {
        resolve();
        window.removeEventListener('toastRemoved', onRemoval);
      }
    };
    window.addEventListener('toastRemoved', onRemoval);
  }),
  REMOVED_BY,
  openScimBlockedErrorToast,
};

export default toastUtils;
