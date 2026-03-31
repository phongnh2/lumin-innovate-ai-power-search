import { t } from 'i18next';

import { closeModal, openViewerModal } from 'actions/customActions';
import { closeElement } from 'actions/exposedActions';
import { store } from 'src/redux/store';

import logger from 'helpers/logger';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_UNKNOWN_ERROR, ERROR_MESSAGE_CONTACT_SUPPORT } from 'constants/messages';
import { STATIC_PAGE_URL } from 'constants/urls';

export function parseErrorString(errorString) {
  const isStringError = typeof errorString === 'string';
  if (!isStringError) {
    return null;
  }
  const regex = /Exception:\s*Message:\s*(.*?)\s*Filename:\s*(.*?)\s*Function:\s*(.*?)\s*Linenumber:\s*(.*?)$/s;
  const match = errorString.match(regex);

  if (match) {
    return {
      message: match[1].trim(),
      filename: match[2].trim(),
      function: match[3].trim(),
      lineNumber: match[4].trim(),
    };
  }
  return null; // Return null if no match is found
}

export default ({ error, service }) => {
  const parsedError = parseErrorString(error) ?? error;
  logger.logError({
    error: parsedError,
    reason: service || LOGGER.Service.PDFTRON,
  });
  store.dispatch(closeElement('loadingModal'));

  store.dispatch(
    openViewerModal({
      type: ModalTypes.ERROR,
      title: t(ERROR_MESSAGE_UNKNOWN_ERROR),
      message: t(ERROR_MESSAGE_CONTACT_SUPPORT),
      cancelButtonTitle: t('action.cancel'),
      confirmButtonTitle: t('common.contactSupport'),
      isFullWidthButton: true,
      onCancel: () => {
        store.dispatch(closeModal());
      },
      onConfirm: () => {
        store.dispatch(closeModal());
        window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport')), '_blank');
      },
    })
  );
};
