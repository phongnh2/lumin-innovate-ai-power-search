/// <reference path="./signature.d.ts" />
/* eslint-disable no-await-in-loop */
import get from 'lodash/get';

import selectors from 'selectors';

import timeTracking from 'screens/Viewer/time-tracking';

import userServices from 'services/userServices';

import { getFileService, file as fileUtils, eventTracking } from 'utils';

import { SIGNATURE_PAGE_SIZE } from 'features/Signature/constants';
import { getCanvasSize } from 'features/Signature/utils';

import UserEventConstants from 'constants/eventConstants';

import { store } from '../redux/store';

const { getState } = store;

const getImageSource = ({ imageData, currentUser, remoteId }) => {
  const loadDefaultSignature = !currentUser;
  if (imageData) {
    return imageData;
  }
  return `${getFileService.getSignatureUrl(remoteId)}${
    loadDefaultSignature ? '?' : '&'
  }timestamp=${new Date().getTime()}`;
};

function getBase64FromUrl({ imageData, remoteId = '' }) {
  return new Promise((resolve) => {
    const image = new Image();
    const src = getImageSource({ imageData, remoteId });
    image.src = src;
    image.setAttribute('crossorigin', 'anonymous');
    const timeTrackingName = `getBase64FromUrl-${remoteId}`;
    timeTracking.register(timeTrackingName);
    image.onload = function () {
      const canvas = document.createElement('canvas');
      const { width, height } = getCanvasSize({ imageWidth: image.width, imageHeight: image.height });
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

      const mimeType = fileUtils.getMimeTypeFromSignedUrl(src);
      const signatureData = {
        width: image.width,
        height: image.height,
        imgSrc: canvas.toDataURL(mimeType),
        remoteId,
      };
      timeTracking.finishTracking(timeTrackingName);
      canvas.toBlob((blob) => {
        eventTracking(UserEventConstants.EventType.SIGNATURE_INFO, {
          signatureId: remoteId,
          timeToLoadSignature: timeTracking.trackingTimeOf(timeTrackingName),
          signatureSizeMB: blob.size / 1024 / 1024,
        });
        timeTracking.unRegister(timeTrackingName);
      });
      resolve(signatureData);
    };

    image.onerror = function () {
      timeTracking.unRegister(timeTrackingName);
      const signatureDataError = {
        width: 100,
        height: 100,
        imgSrc: '',
        remoteId,
      };
      resolve(signatureDataError);
    };
  });
}

async function fetchUserSignatureSignedUrlsInRange({ offset }) {
  const { signatures, hasNext, total } = await userServices.getUserSignatureSignedUrlsInRange({
    offset,
    limit: SIGNATURE_PAGE_SIZE,
  });
  return { hasNext, signatures, total };
}

function getNumberOfSignatures(currentUser) {
  const userSignatures = selectors.getUserSignatures(getState());
  const noSyncSignatures = userSignatures.filter((userSignature) => !userSignature.remoteId);
  const totalSignatures = get(currentUser, 'signatures', []).length + noSyncSignatures.length;
  return Math.max(totalSignatures, userSignatures.length);
}

export default {
  getBase64FromUrl,
  fetchUserSignatureSignedUrlsInRange,
  getNumberOfSignatures,
};
