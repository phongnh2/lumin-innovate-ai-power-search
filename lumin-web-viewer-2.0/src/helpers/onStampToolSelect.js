import { t } from 'i18next';

import core from 'core';
import selectors from 'selectors';

import StampAnnotationBuilder from 'helpers/stampAnnotationBuilder';

import { canUseImageSignedUrl } from 'utils/documentUtil';
import toastUtils from 'utils/toastUtils';

import defaultTool from 'constants/defaultTool';
import { images } from 'constants/documentType';

export default (state) => {
  const inputElement = document.createElement('input');
  inputElement.type = 'file';
  inputElement.style.display = 'none';
  inputElement.accept = 'image/png,image/jpg,image/jpeg';
  window.document.body.appendChild(inputElement);
  inputElement.addEventListener(
    'change',
    () => {
      if (!inputElement.files || !inputElement.files[0]) {
        return;
      }
      const file = inputElement.files[0];
      const validTypes = [images.PNG, images.JPG, images.JPEG];
      if (!validTypes.includes(file.type)) {
        toastUtils.error({
          message: t('viewer.signatureModal.pleaseUploadAnImage'),
        });
        return;
      }
      const currentDocument = selectors.getCurrentDocument(state);
      const builder = new StampAnnotationBuilder(inputElement.files[0]);
      core.setToolMode(defaultTool);
      const isValidToUseSignedUrl = canUseImageSignedUrl();
      if (isValidToUseSignedUrl) {
        builder.addUrlImageToDocument(currentDocument);
      } else {
        builder.addBase64ImageToDocument();
      }
    },
    { once: true }
  );

  document.body.onfocus = () => {
    window.document.body.removeChild(inputElement);
    core.setToolMode(defaultTool);
    document.body.onfocus = null;
  };
  inputElement.click();
};
