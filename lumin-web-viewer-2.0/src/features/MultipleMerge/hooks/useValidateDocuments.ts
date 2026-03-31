import { useDisclosure } from '@mantine/hooks';
import { get } from 'lodash';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useGetCurrentUser, useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import { organizationServices } from 'services';

import { getHitDocStackModalContent } from 'utils/getHitDocStackModalContent';
import { getPremiumModalContent } from 'utils/getPremiumModalContent';

import { Plans, PRICING_VERSION } from 'constants/plan';

import { HitDocStackModal } from 'interfaces/document/document.interface';
import { IOrganization, PremiumModalContentType } from 'interfaces/organization/organization.interface';
import { ITrialInfo } from 'interfaces/payment/payment.interface';

export const useValidateDocuments = ({ getAbortController }: { getAbortController: () => AbortController }) => {
  const [openedPremiumModal, openedPremiumModalHandlers] = useDisclosure(false);
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const [premiumModalContent, setPremiumModalContent] = useState<PremiumModalContentType>(null);
  const [hitDocStackModalContent, setHitDocStackModalContent] = useState<HitDocStackModal>(null);
  const { t } = useTranslation();
  const {
    data: currentOrganization = {
      payment: {},
    } as IOrganization,
  } = useShallowSelector(selectors.getCurrentOrganization);
  const orgId = get(currentOrganization, '_id', '');
  const trialInfo = get(currentOrganization, 'payment.trialInfo', {} as ITrialInfo);

  const validatePremiumFeature = useCallback(
    (orgTrialInfo: Partial<ITrialInfo>) => {
      const isOldPlan =
        currentUser.payment.priceVersion !== PRICING_VERSION.V3 && currentUser.payment.type !== Plans.FREE;
      const content = getPremiumModalContent({
        trialInfo: orgTrialInfo,
        orgId,
        isOldPlan,
      });
      openedPremiumModalHandlers.open();
      setPremiumModalContent(content);
    },
    [currentUser.payment.priceVersion, currentUser.payment.type, orgId, openedPremiumModalHandlers]
  );

  const validateHitDocStack = useCallback(
    (orgTrialInfo: Partial<ITrialInfo>) => {
      const content = getHitDocStackModalContent({
        t,
        userRole: currentOrganization.userRole,
        navigate,
        payment: currentOrganization.payment,
        trialInfo: orgTrialInfo,
        orgId,
      });
      setHitDocStackModalContent(content);
      dispatch(actions.openModal(content));
    },
    [t, currentOrganization.userRole, currentOrganization.payment.type, navigate, orgId, dispatch]
  );

  const shouldBlockMergeProcess = useCallback(async () => {
    if (premiumModalContent) {
      openedPremiumModalHandlers.open();
      return true;
    }

    if (hitDocStackModalContent) {
      dispatch(actions.openModal(hitDocStackModalContent));
      return true;
    }

    if (!currentOrganization?.userPermissions?.canUseMultipleMerge) {
      validatePremiumFeature({
        canUseProTrial: trialInfo.canUseProTrial,
        canUseBusinessTrial: trialInfo.canUseBusinessTrial,
      });
      return true;
    }

    if (!orgId) {
      return false;
    }

    const { isOverDocStack } = await organizationServices.checkOrganizationDocStack(orgId, {
      signal: getAbortController().signal,
    });
    if (isOverDocStack) {
      validateHitDocStack({
        canStartTrial: trialInfo.canStartTrial,
        canUseProTrial: trialInfo.canUseProTrial,
      });
      return true;
    }

    return false;
  }, [
    premiumModalContent,
    hitDocStackModalContent,
    orgId,
    getAbortController,
    currentOrganization?.userPermissions?.canUseMultipleMerge,
    openedPremiumModalHandlers,
    dispatch,
    validatePremiumFeature,
    trialInfo.canUseProTrial,
    trialInfo.canUseBusinessTrial,
    trialInfo.canStartTrial,
    validateHitDocStack,
  ]);

  return {
    shouldBlockMergeProcess,
    premiumModalContent,
    openedPremiumModal,
    openedPremiumModalHandlers,
  };
};
