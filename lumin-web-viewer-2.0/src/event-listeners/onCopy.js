import i18n from 'i18next';

import { encoder } from '@libs/encoder';

import actions from 'actions';
import core from 'core';

import { validateAnnotationsToBeCopied } from 'helpers/copyAnnotationHelper';
import copyText from 'helpers/copyText';
import { isFirefox, isSafari } from 'helpers/device';
import exportAnnotations from 'helpers/exportAnnotations';

import toastUtils from 'utils/toastUtils';

export default (store) => async (e) => {
  const { dispatch } = store;

  const selectedTextFromCanvas = core.getSelectedText();
  const selectedTextFromDOM = window.getSelection().toString();

  if (selectedTextFromCanvas) {
    e.preventDefault();
    copyText(e.clipboardData);
    dispatch(actions.closeElement('textPopup'));
  } else if (core.getSelectedAnnotations().length > 0 && !selectedTextFromDOM) {
    e.preventDefault();
    e.stopPropagation();
    const isValid = await validateAnnotationsToBeCopied();

    if (!isValid) {
      toastUtils.error({
        message: i18n.t('message.copyAnnotationsLimitExceeded'),
      });
      return;
    }
      core.updateCopiedAnnotations();
      const listAnnots = core.getAnnotationManager().getCopiedAnnotations();
      if (listAnnots.length === 0 || isFirefox || isSafari) {
        return;
      }
      const xfdf = await exportAnnotations({
        annotationList: listAnnots,
      });
      const base64Xfdf = encoder.btoa(xfdf);
      const spanEl = document.createElement('span');
      spanEl.dataset.meta = `<--(lumin-data)${base64Xfdf}(/lumin-data)-->`;
      spanEl.dataset.copyId = listAnnots[0].Id;
      const clipboardItem = e.clipboardData;
      let htmlContent = spanEl.outerHTML;
      const content = listAnnots[0].getContents();
      if (listAnnots.length === 1 && !!content) {
        clipboardItem.clearData('text/plain');
        clipboardItem.setData('text/plain', listAnnots[0].getContents());
        const divEl = document.createElement('div');
        divEl.textContent = listAnnots[0].getContents();
        htmlContent = spanEl.outerHTML.concat(divEl.outerHTML);
      }
      // clipboardItem.clearData('text/html');
      // clipboardItem.setData('text/html', htmlContent);
      if (!clipboardItem.getData('text/html')) {
        navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlContent], { type: 'text/html' }) })]);
      }
  }
};
