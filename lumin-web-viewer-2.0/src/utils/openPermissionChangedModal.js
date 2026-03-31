import { openModal } from 'actions/customActions';

import { store } from 'store';

import { ModalTypes } from 'constants/lumin-common';

/**
 * Fallback store due to circular dependency issue
 */
const { dispatch } = store || {};

export const openPermissionChangedModal = ({ closable, t } = {}) => {
  if (!dispatch) {
    return;
  }
  const modalSettings = {
    type: ModalTypes.WARNING,
    title: t('orgPage.yourPermissionUpdated'),
    message: t('orgPage.reloadToHaveNewPermission'),
    disableBackdropClick: !closable,
    disableEscapeKeyDown: !closable,
    isFullWidthButton: true,
    confirmButtonTitle: t('common.reload'),
    onConfirm: () => window.location.reload(),
  };
  dispatch(openModal(modalSettings));
};
