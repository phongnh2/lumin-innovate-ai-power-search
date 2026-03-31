import { TFunction } from 'react-i18next';

import { SHARE_DOCUMENT_ACTION_LIST } from '../constants/documentAction.constant';

export const lowercase = (text?: string): string => text?.toLowerCase() ?? '';

export const formatLabelWithConjunction = (
  items: string[],
  conjunction: string,
  { lowerCaseAll = false }: { lowerCaseAll?: boolean } = {}
): string => {
  if (items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  const formattedItems = lowerCaseAll
    ? items.map((item) => lowercase(item))
    : [items[0], ...items.slice(1).map((item) => lowercase(item))];

  if (items.length === 2) {
    return `${formattedItems[0]} ${lowercase(conjunction)} ${formattedItems[1]}`;
  }

  const lastItem = formattedItems[formattedItems.length - 1];
  const previousItems = formattedItems.slice(0, -1);
  return `${previousItems.join(', ')} ${lowercase(conjunction)} ${lastItem}`;
};

export const formatShareDocumentActionLabel = (t: TFunction): string => {
  const actions = SHARE_DOCUMENT_ACTION_LIST.map((item) => t(`action.${item}`));
  return formatLabelWithConjunction(actions, t('common.or'), { lowerCaseAll: true });
};
