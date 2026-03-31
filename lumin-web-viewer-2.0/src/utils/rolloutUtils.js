/// <reference path="./rolloutUtils.d.ts" />

import { DIVISOR_TO_GET_REMAINDER, REMAINDER_NUMBER } from 'constants/rolloutConstants';

import commonUtils from './common';

function getHexValueFromUserId(userId){
  const hexValueFromUserId = userId.substr(0, 8);
  return commonUtils.convertHexToDec(`0x${hexValueFromUserId}`);
}

function isRateAppViaAutoSync(userId) {
  if (userId) {
    const decValue = getHexValueFromUserId(userId);
    return decValue % DIVISOR_TO_GET_REMAINDER <= REMAINDER_NUMBER.GET_20_PERCENT;
  }
  return false;
}

export default {
  isRateAppViaAutoSync,
};
