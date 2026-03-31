/* eslint-disable sonarjs/cognitive-complexity */
// eslint-disable-next-line import/no-unresolved
import { SignatureIcon } from '@luminpdf/icons/dist/csr/Signature';
import get from 'lodash/get';
import { ButtonColorType } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import useToolProperties from '@new-ui/hooks/useToolProperties';

import xeroIcon from 'assets/images/xero.png';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import organizationServices from 'services/organizationServices';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import { getPaymentUrl } from 'helpers/getPaymentUrl';

import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/constants/BannerEvent';
import { PaymentUrlSerializer } from 'utils/payment';
import { eventTracking } from 'utils/recordUtil';

import useCreateCertifiedVersion from 'features/DigitalSignature/hooks/useCreateCertifiedVersion';
import { digitalSignatureActions, digitalSignatureSelectors } from 'features/DigitalSignature/slices';
import useApplyOcrTool from 'features/DocumentOCR/useApplyOcrTool';
import { useShowRevisionBanner } from 'features/DocumentRevision/hooks/useShowRevisionBanner';
import { useFormFieldDetectionUsage } from 'features/FormFieldDetection/hooks/useFormFieldDetectionUsage';
import { useProcessFormFieldDetection } from 'features/FormFieldDetection/hooks/useProcessFormFieldDetection';
import { useShouldShowFormFieldDetectionBanner } from 'features/FormFieldDetection/hooks/useShouldShowFormFieldDetectionBanner';
import { useMatchMediaLayoutContext } from 'features/MatchMediaLayout/hooks/useMatchMediaLayoutContext';
import { APP_URL_PATH, APP_NAMES } from 'features/MiniApps/constants';
import { useShowXeroBannerStore } from 'features/MiniApps/hooks/useShowXeroBanner';
import { useGetCurrentOrg } from 'features/SaveAsTemplate/hooks/useGetCurrentOrg';
import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import { BannerViewerPosition } from 'constants/banner';
import defaultTool from 'constants/defaultTool';
import UserEventConstants from 'constants/eventConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, Plans } from 'constants/plan';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { Routers } from 'constants/Routers';
import TOOLS_NAME from 'constants/toolsName';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import useShowOCRBanner from './useShowOCRBanner';

const useBannerData = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isShowBannerAds = useSelector(selectors.getIsShowBannerAds);
  const hasOcrPermission = currentDocument?.premiumToolsInfo?.ocr;
  const { closeToolPropertiesPanel } = useToolProperties();

  const { t } = useTranslation();
  const shouldShowOCRBanner = useShowOCRBanner();
  const {
    shouldShowFormFieldDetectionBanner,
    shouldReopenViewerBanner,
    hasCloseViewerBanner,
    setHasCloseViewerBanner,
    setHasCloseFormFieldDetectionBanner,
  } = useShouldShowFormFieldDetectionBanner();
  const { overFFDQuotaMessage, isOverFFDQuota, isLoadingFFDUsage } = useFormFieldDetectionUsage();
  const dispatch = useDispatch();
  const applyOcr = useApplyOcrTool();
  const applyFormFieldDetection = useProcessFormFieldDetection();
  const { isNarrowScreen } = useMatchMediaLayoutContext();
  const shouldShowCreateCertifiedVersionBanner = useSelector(
    digitalSignatureSelectors.shouldShowCreateCertifiedVersionBanner
  );
  const { createCertifiedVersion } = useCreateCertifiedVersion();
  const { documentStatus = {} } = currentDocument || {};
  const isAdmin = organizationServices.isManager(get(currentDocument, 'documentReference.data.userRole', ''));

  const paymentInfomations = get(currentDocument, 'documentReference.data.payment', {});
  const isFreePlan = get(currentDocument, 'documentReference.data.payment.type', '') === Plans.FREE;

  const canStartTrial = get(paymentInfomations, 'trialInfo.canStartTrial', false);
  const canUseBussinessTrial = get(paymentInfomations, 'trialInfo.canUseBusinessTrial', false);
  const canUseProTrial = get(paymentInfomations, 'trialInfo.canUseProTrial', false);

  const orgId = getOrgIdOfDoc({ currentDocument });
  const paymentUrl = getPaymentUrl({ currentDocument, orgId });

  const shouldShowRevisionBanner = useShowRevisionBanner();
  const shouldShowXeroBanner = useShowXeroBannerStore((state) => state.shouldShowXeroBanner);

  const currentOrganization = useGetCurrentOrg();

  const actionOcrForUserNotHasPermission = () => {
    dispatch(actions.closeLuminRightPanel());
    dispatch(actions.openPageEditMode());
    closeToolPropertiesPanel();

    core.deselectAllAnnotations();
    core.enableReadOnlyMode();
    core.setToolMode(defaultTool);
    dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value));

    dispatch(
      accessToolModalActions.openModal({
        toolName: TOOLS_NAME.OCR,
        eventName: PremiumToolsPopOverEvent.OCR,
      })
    );
  };

  const banners = {
    trial: {
      title: t('viewer.banner.titleUseFreeTrial', { days: FREE_TRIAL_DAYS }),
      btnData: {
        btnContent: t('viewer.banner.upgradeFree'),
        btnDirectTo: Routers.PAYMENT_FREE_TRIAL,
      },
      bannerEvent: {
        bannerName: BannerName.START_FREE_TRIAL_VIEWER_TOP,
        bannerPurpose: BannerPurpose[BannerName.START_FREE_TRIAL_VIEWER_TOP],
      },
      type: ButtonColorType.warning,
      position: BannerViewerPosition.TOP,
    },
    default: {
      manager: {
        title: t('viewer.banner.titleOrgFree'),
        btnData: {
          btnContent: t('viewer.banner.goPlan', { plan: 'Business' }),
          btnDirectTo: `${Routers.ORG_ANNUAL_PAYMENT_URL}?${UrlSearchParam.PAYMENT_ORG_TARGET}=${getOrgIdOfDoc({
            currentDocument,
          })}`,
        },
        bannerEvent: {
          bannerName: BannerName.UPGRADE_BUSINESS_VIEWER_TOP,
          bannerPurpose: BannerPurpose[BannerName.UPGRADE_BUSINESS_VIEWER_TOP],
        },
        type: ButtonColorType.warning,
        position: BannerViewerPosition.TOP,
      },
      other: {
        title: t('viewer.banner.titlePersonalFree'),
        btnData: {
          btnContent: t('viewer.banner.goPlan', { plan: 'Premium' }),
          btnDirectTo: Routers.INDIVIDUAL_MONTHLY_PAYMENT_URL,
        },
        bannerEvent: {
          bannerName: BannerName.UPGRADE_PREMIUM_VIEWER_TOP,
          bannerPurpose: BannerPurpose[BannerName.UPGRADE_PREMIUM_VIEWER_TOP],
        },
        type: ButtonColorType.warning,
        position: BannerViewerPosition.TOP,
      },
    },
    ocr: {
      title: (
        <Trans
          i18nKey="viewer.ocr.bannerDescription"
          components={{
            Link: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                href="https://www.luminpdf.com/blog/what-is-optical-character-recognition-ocr/"
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
        />
      ),
      titleClassname: 'ViewerBanner__message--ocr',
      btnClassName: 'ViewerBanner__btn--ocr',
      btnData: {
        btnContent: t('viewer.ocr.actionButton'),
        btnOnClick: !hasOcrPermission ? actionOcrForUserNotHasPermission : applyOcr,
        btnDirectTo: undefined,
      },
      bannerEvent: {
        bannerName: BannerName.PROMPT_USER_OCR_SCANNED_DOCUMENT,
        bannerPurpose: BannerPurpose[BannerName.PROMPT_USER_OCR_SCANNED_DOCUMENT],
      },
      type: 'info',
      position: BannerViewerPosition.INSIDE,
    },
    revision: {
      title: t('viewer.revision.upgrade.banner', { context: isAdmin ? 'admin' : 'member' }),
      btnClassName: `revision-banner-btn${!isAdmin ? '-disabled' : ''}`,
      btnData: {
        btnContent: t('common.goPro'),
        btnDirectTo: paymentUrl,
      },
      bannerEvent: {
        bannerName: BannerName.VERSION_HISTORY_UPGRADE,
        bannerPurpose: BannerPurpose[BannerName.VERSION_HISTORY_UPGRADE],
      },
      type: ButtonColorType.warning,
      position: BannerViewerPosition.NONE,
    },
    formFieldDetection: {
      title: t('viewer.formFieldDetection.bannerDescription'),
      btnData: {
        btnContent: t('viewer.formFieldDetection.actionButton'),
        btnOnClick: applyFormFieldDetection,
        disabled: isLoadingFFDUsage || isOverFFDQuota,
        loading: isLoadingFFDUsage,
        tooltip: overFFDQuotaMessage,
      },
      hasStartIcon: true,
      startIcon: {
        content: 'sparkles',
        width: 16,
        height: 16,
      },
      bannerEvent: {
        bannerName: BannerName.PROMPT_USER_TO_AUTO_ADD_FIELD,
        bannerPurpose: BannerPurpose[BannerName.PROMPT_USER_TO_AUTO_ADD_FIELD],
      },
      position: BannerViewerPosition.INSIDE,
    },
    certifiedVersion: {
      title: t('viewer.bananaSign.bannerDescription'),
      btnData: {
        btnContent: t('viewer.bananaSign.saveCertifiedVersion'),
        btnOnClick: createCertifiedVersion,
        backgroundColor: 'var(--kiwi-colors-support-violet-background-lowest)',
        btnDirectTo: undefined,
      },
      startIcon: <SignatureIcon size={24} color="var(--kiwi-colors-support-violet-foreground-highest)" />,
      backgroundColor: 'var(--kiwi-colors-support-violet-background-highest)',
      color: 'var(--kiwi-colors-support-violet-foreground-highest)',
      bannerEvent: {
        bannerName: BannerName.PROMPT_USER_TO_CREATE_CERTIFIED_VERSION,
        bannerPurpose: BannerPurpose[BannerName.PROMPT_USER_TO_CREATE_CERTIFIED_VERSION],
      },
      position: BannerViewerPosition.INSIDE,
    },
    xero: {
      title: t('viewer.xeroBanner.description'),
      btnData: {
        btnContent: t('viewer.xeroBanner.button'),
        btnDirectTo: `/${ORG_TEXT}/${currentOrganization?.url}/${APP_URL_PATH}/${APP_NAMES.XERO_INTEGRATION}`,
        btnDirectToNewTab: true,
      },
      startIcon: <img src={xeroIcon} alt="xero" style={{ width: '32px', height: '32px' }} />,
      bannerEvent: {
        bannerName: BannerName.PROMPT_USER_TO_CONNECT_XERO,
        bannerPurpose: BannerPurpose[BannerName.PROMPT_USER_TO_CONNECT_XERO],
      },
      position: BannerViewerPosition.TOP,
    },
  };

  const specialDirectURL = ({ plan, period, isTrial = false, from }) => {
    const serializer = new PaymentUrlSerializer()
      .plan(plan)
      .period(period)
      .trial(isTrial)
      .of(getOrgIdOfDoc({ currentDocument }))
      .returnUrlParam();

    if (from) {
      return serializer.fromParam(from).get();
    }

    return serializer.get();
  };

  const getBannerData = () => {
    if (isAdmin && isFreePlan && !shouldShowRevisionBanner) {
      if (!canStartTrial) {
        return {
          ...banners.default.other,
          btnData: {
            ...banners.default.other.btnData,
            btnDirectTo: specialDirectURL({
              plan: Plans.ORG_PRO,
              period: PERIOD.ANNUAL,
            }),
          },
        };
      }

      if (canUseProTrial || canUseBussinessTrial) {
        return {
          ...banners.trial,
          btnData: {
            ...banners.trial.btnData,
            btnDirectTo: specialDirectURL({
              plan: canUseProTrial ? Plans.ORG_PRO : Plans.ORG_BUSINESS,
              period: PERIOD.ANNUAL,
              isTrial: true,
            }),
          },
        };
      }
      return banners.default[documentStatus.openedBy];
    }
    if (shouldShowOCRBanner) {
      return banners.ocr;
    }
    if (shouldShowXeroBanner) {
      return banners.xero;
    }
    if (shouldShowFormFieldDetectionBanner) {
      return banners.formFieldDetection;
    }
    if (shouldShowCreateCertifiedVersionBanner) {
      return banners.certifiedVersion;
    }

    if (shouldShowRevisionBanner) {
      return banners.revision;
    }
    return banners.default.other;
  };

  const selectedBanner = getBannerData();

  const eventAttributes = {
    clientId: currentUser?.clientId,
    bannerName: selectedBanner.bannerEvent?.bannerName || '',
    bannerPurpose: selectedBanner.bannerEvent?.bannerPurpose || '',
  };

  useEffect(() => {
    if (selectedBanner.position === BannerViewerPosition.TOP && isShowBannerAds) {
      dispatch(actions.setIsShowTopViewerBanner(true));
    } else {
      dispatch(actions.setIsShowTopViewerBanner(false));
    }
  }, [selectedBanner.position, isShowBannerAds]);

  useEffect(() => {
    if (
      (isFreePlan && isAdmin && !hasCloseViewerBanner) ||
      shouldShowCreateCertifiedVersionBanner ||
      shouldShowOCRBanner ||
      shouldShowRevisionBanner ||
      shouldReopenViewerBanner ||
      shouldShowFormFieldDetectionBanner ||
      shouldShowXeroBanner
    ) {
      dispatch(actions.setIsShowBannerAds(true));
      return;
    }
    dispatch(actions.setIsShowBannerAds(false));
  }, [
    isFreePlan && isAdmin && !hasCloseViewerBanner,
    isAdmin,
    shouldShowCreateCertifiedVersionBanner,
    shouldShowOCRBanner,
    shouldShowRevisionBanner,
    shouldReopenViewerBanner,
    shouldShowFormFieldDetectionBanner,
    shouldShowXeroBanner,
  ]);

  const onClickBannerLink = () => {
    eventTracking(UserEventConstants.EventType.BANNER_CONFIRMATION, eventAttributes);
    if (typeof selectedBanner.btnData.btnOnClick === 'function') {
      selectedBanner.btnData.btnOnClick();
    }
  };

  const onClickCloseBanner = () => {
    if (shouldShowFormFieldDetectionBanner) {
      setHasCloseFormFieldDetectionBanner(true);
    } else {
      setHasCloseViewerBanner(true);
    }

    dispatch(actions.setIsShowBannerAds(false));
    dispatch(actions.setShouldShowOCRBanner(false));
    dispatch(digitalSignatureActions.setShouldShowBanner(false));
    useShowXeroBannerStore.getState().setShouldShowXeroBanner(false);
    eventTracking(UserEventConstants.EventType.BANNER_DISMISS, eventAttributes);
  };

  return {
    selectedBanner,
    onClickBannerLink,
    onClickCloseBanner,
    shouldShowBanner: !isNarrowScreen && isShowBannerAds,
  };
};

export default useBannerData;
