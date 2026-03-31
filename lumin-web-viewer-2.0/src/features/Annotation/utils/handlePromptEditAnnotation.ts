import { t } from 'i18next';
import capitalize from 'lodash/capitalize';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import LocalStorageUtils from 'utils/localStorage';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';

type ActionType = typeof ANNOTATION_ACTION[keyof typeof ANNOTATION_ACTION];

interface IParams {
  action: ActionType;
  onConfirm: () => void;
  onCancel: () => void;
}

const getTranslationByActionType = ({ action }: { action: ActionType }) => {
  switch (action) {
    case ANNOTATION_ACTION.MODIFY:
      return t('action.edit');
    case ANNOTATION_ACTION.DELETE:
      return t('action.delete');
    default:
      return t('common.add');
  }
};

export const handlePromptEditAnnotation = ({ action, onConfirm, onCancel }: IParams) => {
  const promptChangeAnnotOfOtherPeople = LocalStorageUtils.get({
    key: LocalStorageKey.SHOULD_HIDE_CHANGE_ANNOTATION_OF_OTHER_PEOPLE_PROMPT ,
  });

  const promptData = JSON.parse(promptChangeAnnotOfOtherPeople || '[]') as ActionType[];

  if (promptData.includes(action)) {
    onConfirm();
    return;
  }

  store.dispatch(
    actions.openViewerModal({
      type: ModalTypes.WARNING,
      title: t('viewer.editAnnotationModal.title', { actionType: capitalize(getTranslationByActionType({ action })) }),
      message: t('viewer.editAnnotationModal.message', { actionType: getTranslationByActionType({ action }) }),
      checkboxMessage: t('modalWarningDeleteContentBox.checkboxMessage'),
      footerVariant: 'variant3',
      confirmButtonTitle: t('common.confirm'),
      onConfirm: (isChecked: boolean) => {
        LocalStorageUtils.set({
          key: LocalStorageKey.SHOULD_HIDE_CHANGE_ANNOTATION_OF_OTHER_PEOPLE_PROMPT ,
          value: JSON.stringify(isChecked ? [...promptData, action] : promptData),
        });
        onConfirm();
      },
      onCancel,
    }) as AnyAction
  );
};
