import { get } from 'lodash';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';

import { COMPRESS_QUALITY } from '../constants';
import { CompressLevelValidationType } from '../types';

export const useCompressLevelValidation = (): CompressLevelValidationType => {
  const organizations = useShallowSelector(selectors.getOrganizationList);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const documentSize = currentDocument?.size || 0;

  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');
  const paymentInfomations = get(currentDocument, 'documentReference.data.payment', {});
  const canStartTrial = get(paymentInfomations, 'trialInfo.canStartTrial', false);
  const { fileSizeLimitInMB, availableCompressQuality } = currentDocument?.premiumToolsInfo?.compressPdf || {};

  const documentOrgOwner = getOrgOfDoc({ organizations, currentDocument });
  const isMember = documentOrgOwner?.userRole?.toUpperCase() === ORGANIZATION_ROLES.MEMBER;

  const isBusinessOrEnterprisePlan = [Plans.ORG_BUSINESS, Plans.ENTERPRISE].includes(currentPlan);

  const enableServerCompression = availableCompressQuality?.includes(COMPRESS_QUALITY.MAXIMUM);

  const isFileSizeExceed = documentSize > fileSizeLimitInMB * 1024 * 1024;

  const isCompressQualityAvailable = (quality: COMPRESS_QUALITY) => availableCompressQuality?.includes(quality);

  const isCompressLevelDisabled = (level: COMPRESS_QUALITY): boolean => {
    if (level === COMPRESS_QUALITY.NONE) return false;

    return isFileSizeExceed || !isCompressQualityAvailable(level);
  };

  return {
    isMember,
    canStartTrial,
    isFileSizeExceed,
    isCompressLevelDisabled,
    isBusinessOrEnterprisePlan,
    enableServerCompression,
  };
};
