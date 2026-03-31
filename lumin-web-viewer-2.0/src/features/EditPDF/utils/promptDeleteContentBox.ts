import { TFunction } from 'i18next';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { ModalTypes } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

export const promptDeleteContentBox = ({ t, onConfirm }: { t: TFunction; onConfirm: () => void }) => {
  store.dispatch(
    actions.openViewerModal({
      type: ModalTypes.WARNING,
      title: t('modalWarningDeleteContentBox.title'),
      message: t('modalWarningDeleteContentBox.message'),
      checkboxMessage: t('modalWarningDeleteContentBox.checkboxMessage'),
      cancelButtonTitle: t('common.cancel'),
      confirmButtonTitle: t('modalWarningDeleteContentBox.confirmButtonTitle'),
      footerVariant: 'variant2',
      onCancel: () => store.dispatch(actions.closeModal() as AnyAction),
      onConfirm: (isChecked: boolean) => {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY.SHOULD_NOT_SHOW_DELETE_CONTENT_BOX_WARNING_MODAL,
          isChecked.toString()
        );
        onConfirm();
      },
    }) as AnyAction
  );
};
