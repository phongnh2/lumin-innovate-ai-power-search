import get from 'lodash/get';

import core from 'core';

import logger from 'helpers/logger';

import fileUtils from 'utils/file';
import { CJK_UNICODE_REGEX } from 'utils/regex';

import { defaultMaxDimension, getCanvasSize, imageCanvasMultiplier } from 'features/Signature/utils';

import { CUSTOM_DATA_STAMP_ANNOTATION } from 'constants/customDataConstant';
import { images } from 'constants/documentType';
import { LOGGER } from 'constants/lumin-common';

const CUSTOM_DATA_ELEMENT = 'trn-custom-data';

export const setCustomAnnotationSerializer = () => {
  window.Core.Annotations.setCustomSerializeHandler(
    window.Core.Annotations.StampAnnotation as unknown as Core.Annotations.StampAnnotation,
    (originalElement, pageMatrix, options) => {
      const annot = options.annotation as Core.Annotations.StampAnnotation & { image: HTMLImageElement };
      const element = options.originalSerialize(originalElement, pageMatrix) as Element;
      try {
        if (annot.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)) {
          const canvas = document.createElement('canvas');
          const { width, height } = getCanvasSize({
            imageWidth: annot.image.width,
            imageHeight: annot.image.height,
            pageWidth: Math.max(defaultMaxDimension, Math.ceil(annot.Width * imageCanvasMultiplier)),
            pageHeight: Math.max(defaultMaxDimension, Math.ceil(annot.Height * imageCanvasMultiplier)),
          });
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(annot.image, 0, 0, annot.image.width, annot.image.height, 0, 0, width, height);
          const mimeType = fileUtils.getMimeTypeFromSignedUrl(annot.image.src);
          const base64Data = canvas.toDataURL(mimeType === images.JPEG ? mimeType : images.PNG);
          const imageData = element.getElementsByTagName('imagedata')[0];
          imageData.textContent = base64Data;
        }
      } catch (error: unknown) {
        logger.logError({
          reason: LOGGER.Service.PDFTRON,
          error,
        });
      }
      return element;
    }
  );

  /* TEMPORARY FIX FOR LMV-4844 */
  const LATIN_LINE_HEIGHT_RATIO = 0.75;
  const CJK_LINE_HEIGHT_RATIO = 0.6; // Chinese/Japanese/Korean character line height ratio
  window.Core.Annotations.setCustomSerializeHandler(
    window.Core.Annotations.FreeTextAnnotation as unknown as Core.Annotations.FreeTextAnnotation,
    (originalElement, pageMatrix, options) => {
      const {
        Height: originalHeight,
        linesCount,
        FontSize,
      } = options.annotation as Core.Annotations.FreeTextAnnotation & { linesCount: number };
      const isAutoSized = (options.annotation as Core.Annotations.FreeTextAnnotation).getAutoSizeType() === 'auto';
      const fontSize = parseInt(FontSize?.split('pt')[0]);
      const content = options.annotation.getContents();
      const isCJKCharacter = CJK_UNICODE_REGEX.test(content);
      const lineHeightRatio = isCJKCharacter ? CJK_LINE_HEIGHT_RATIO : LATIN_LINE_HEIGHT_RATIO;
      const minValidHeight = linesCount * (fontSize / lineHeightRatio);
      options.annotation.Height = minValidHeight > originalHeight ? minValidHeight : originalHeight;
      const element = options.originalSerialize(originalElement, pageMatrix) as Element;
      options.annotation.Height = originalHeight;
      if (isAutoSized) {
        (options.annotation as Core.Annotations.FreeTextAnnotation).setAutoSizeType('auto');
      }
      return element;
    }
  );
  /* END */
};
export function updateImageData(
  element: Element,
  imageSignedUrls: Record<string, string>,
  usedImageRemoteIds: Set<string>
) {
  const customDataElement = element.querySelector(CUSTOM_DATA_ELEMENT);
  let customData: Record<string, string>;
  if (customDataElement) {
    customData = JSON.parse(customDataElement.getAttribute('bytes')) as Record<string, string>;
  }
  const remoteId = get<Record<string, string>, string, string>(customData, 'remoteId', '');
  const signedUrlObj = imageSignedUrls || {};
  if (remoteId) {
    if (signedUrlObj[remoteId]) {
      const imageData = element.getElementsByTagName('imagedata')[0];
      imageData.textContent = imageSignedUrls[remoteId];
      usedImageRemoteIds.add(remoteId);
      (core.getDocument() as Core.Document & { isUsingPresignedUrlForImage: boolean }).isUsingPresignedUrlForImage = true;
    } else {
      delete customData.remoteId;
      customDataElement.setAttribute('bytes', JSON.stringify(customData));
    }
  }
}

export const setCustomStampDeserializer = (signedUrlMap: Record<string, string>, usedImageRemoteIds: Set<string>) =>
  window.Core.Annotations.setCustomDeserializeHandler(
    window.Core.Annotations.StampAnnotation as unknown as Core.Annotations.StampAnnotation,
    (element, pageMatrix, options) => {
      updateImageData(element, signedUrlMap, usedImageRemoteIds);
      options.originalDeserialize(element, pageMatrix);
    }
  );
