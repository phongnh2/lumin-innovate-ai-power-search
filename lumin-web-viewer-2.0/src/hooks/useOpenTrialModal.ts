/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { isEmpty } from 'lodash';
import { useState, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation, useMatch, useNavigate } from 'react-router';

import selectors from 'selectors';

import useTrackingModalEvent from 'hooks/useTrackingModalEvent';
import { useViewerMatch } from 'hooks/useViewerMatch';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';
import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import { PaymentUrlSerializer } from 'utils/payment';

import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';
import { useGetOpenFreeTrialOnlyViewer, useGetUrlPaymentTrial } from 'features/CNC/hooks';
import { useOpenCheckoutOnViewer } from 'features/CNC/hooks/useOpenCheckoutOnViewer';
import { useMatchMediaLayoutContext } from 'features/MatchMediaLayout/hooks/useMatchMediaLayoutContext';
import { useEnableNewPricing } from 'features/Pricing/hooks/useEnableNewPricing';

import { LocalStorageKey } from 'constants/localStorageKey';
import { Plans } from 'constants/plan';
import { PaymentPeriod } from 'constants/plan.enum';
import { ROUTE_MATCH, Routers } from 'constants/Routers';
import { RedirectFromPage, UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import useAvailablePersonalWorkspace from './useAvailablePersonalWorkspace';
import useIsLandingPageRequest from './useIsLandingPageRequest';

type SkipTrialType = {
  [key: string]: string[];
};

const useOpenTrialModal = ({
  currentOrg,
}: {
  currentOrg: IOrganization;
}): {
  open: boolean;
  onClose: ({ skip }: { skip: boolean }) => void;
  onClickStartTrial: (params: { skip: boolean; isPricingModal?: boolean; plan?: string }) => void;
  trackModalConfirmation: () => Promise<void>;
  isVariantModal: boolean;
  isVariantPopover: boolean;
  setOpenBillingModal: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDocumentOrg = Boolean(useMatch({ path: ROUTE_MATCH.ORG_DOCUMENT, end: false }));
  const { isViewer } = useViewerMatch();
  const urlSearchParams = new URLSearchParams(location.search);
  const isOpenFromTemplates = urlSearchParams.get(UrlSearchParam.FROM_PAGE) === RedirectFromPage.TEMPLATES;
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { payment } = currentOrg || {};
  const { trialInfo, type } = payment || {};
  const onlyOpenModalInViewer = useGetOpenFreeTrialOnlyViewer();
  const { isLandingPageRequest } = useIsLandingPageRequest();
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const { shouldShowCheckoutOnViewerFlag, isVariantModal, isVariantPopover, setOpenBillingModal } =
    useOpenCheckoutOnViewer();
  const showTrialModal = useSelector(selectors.getShowTrialModal);
  const isViewerModalOpen = useSelector(selectors.isModalOpen);
  const { getUrlPaymentTrial } = useGetUrlPaymentTrial({ currentOrg });
  const isProfessionalUser = useAvailablePersonalWorkspace();
  const { isNarrowScreen } = useMatchMediaLayoutContext();
  const { enabled: enabledPricingModal } = useEnableNewPricing();

  const getSkipTrial = (): SkipTrialType => {
    const defaultValue: Record<string, string[]> = {
      ...(!isEmpty(currentUser) && { [currentUser._id]: [] }),
    };
    try {
      const storage: SkipTrialType =
        JSON.parse(localStorage.getItem(LocalStorageKey.SKIP_ORG_PROMOTION_TRIAL_MODAL)) || {};
      return {
        ...storage,
        ...(!storage[currentUser?._id] && defaultValue),
      };
    } catch (e) {
      return defaultValue;
    }
  };

  const hasSkipFreeTrial = (): boolean => {
    if (isEmpty(currentUser) || isEmpty(currentOrg)) {
      return true;
    }
    const skipTrial = getSkipTrial();
    return skipTrial[currentUser._id].some((orgUrl) => orgUrl === currentOrg?.url);
  };

  const [isSkipped, setSkipped] = useState(true);

  const canUseTrial = trialInfo?.canStartTrial && type === Plans.FREE;

  const isOpen =
    !isSkipped &&
    canUseTrial &&
    !isProfessionalUser &&
    !isOpenFromTemplates &&
    onlyOpenModalInViewer &&
    !isLandingPageRequest &&
    !(isNarrowScreen && isViewer) &&
    !isPreviewOriginalVersionMode &&
    showTrialModal &&
    !isViewerModalOpen;

  useEffect(() => {
    setSkipped(hasSkipFreeTrial());
  }, [currentUser?._id, currentOrg?._id]);

  const { trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: enabledPricingModal ? CNCModalName.NEW_FREE_PRICING_MODAL : ModalName.PROMPT_UPGRADE_FREE_TRIAL,
    modalPurpose: enabledPricingModal ? CNCModalPurpose[CNCModalName.NEW_FREE_PRICING_MODAL] : '',
    isOpen,
  });

  if (!currentOrg?._id || (!isDocumentOrg && !isViewer)) {
    return {
      open: false,
      onClose: () => {},
      onClickStartTrial: () => {},
      trackModalConfirmation: () => Promise.resolve(),
      isVariantModal: false,
      isVariantPopover: false,
      setOpenBillingModal: () => {},
    };
  }

  const handleSkipTrial = (skip: boolean): void => {
    if (skip) {
      const skipTrial = getSkipTrial();
      skipTrial[currentUser._id].push(currentOrg?.url);
      localStorage.setItem(LocalStorageKey.SKIP_ORG_PROMOTION_TRIAL_MODAL, JSON.stringify(skipTrial));
    }
  };

  const onClose = ({ skip }: { skip: boolean }): void => {
    try {
      handleSkipTrial(skip);
      setSkipped(true);
      trackModalDismiss().catch((error: { message: string }) => {
        logger.logError({ message: error.message, error });
      });
    } catch (err) {
      toastUtils.openUnknownErrorToast();
    }
  };

  const onClickStartTrial = ({
    skip,
    isPricingModal,
    plan,
  }: { skip?: boolean; isPricingModal?: boolean; plan?: string } = {}): void => {
    handleSkipTrial(skip);
    trackModalConfirmation().catch((error: { message: string }) => {
      logger.logError({ message: error.message, error });
    });
    if (shouldShowCheckoutOnViewerFlag && !isPricingModal) {
      onClose({ skip: false });
      setOpenBillingModal(true);
      return;
    }
    if (isPricingModal) {
      const url = new PaymentUrlSerializer()
        .of(currentOrg._id)
        .plan(plan)
        .period(PaymentPeriod.ANNUAL)
        .checkout(Routers.CHECKOUT)
        .trialParam(false)
        .returnUrlParam()
        .get();
      navigate(url);
      return;
    }

    const url = getUrlPaymentTrial();
    navigate(url);
  };

  return {
    open: isOpen,
    onClose,
    onClickStartTrial,
    trackModalConfirmation,
    isVariantModal,
    isVariantPopover,
    setOpenBillingModal,
  };
};

export default useOpenTrialModal;
