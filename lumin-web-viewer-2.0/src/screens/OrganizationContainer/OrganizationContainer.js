import React, { useEffect, useCallback, useRef } from 'react';
import { Trans } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withMarketingRedirect from 'HOC/withMarketingRedirect';
import withOrganizationFetching from 'HOC/withOrganizationFetching';

import { useDocumentsRouteMatch, useGapiLoaded, useTranslation } from 'hooks';

import { organizationServices, userServices } from 'services';
import authServices from 'services/authServices';
import * as organizationGraphService from 'services/graphServices/organization';
import { kratosService } from 'services/oryServices';
import { ProfileSettingSections } from 'services/oryServices/kratos';

import logger from 'helpers/logger';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { PaymentUrlSerializer } from 'utils/payment';

import { useSetAvatarOrganizationSuggestion } from 'features/CNC/hooks/useSetAvatarOrganizationSuggestion';
import { useFetchInviteLink } from 'features/InviteLink/hooks/useFetchInviteLink';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes, LOGGER, STATUS_CODE } from 'constants/lumin-common';
import { ORG_SUBSCRIPTION_TYPE, ORG_TEXT } from 'constants/organizationConstants';
import { PERIOD, Plans } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import { useShowWelcomeToast, useErrorSubscriber, useUpdateSetting } from './hooks';
import { useOrgInviteLinkSubscription } from './hooks/useOrgInviteLinkSubscription';
import OrganizationPage from '../OrganizationPage';

const OrganizationContainer = (props) => {
  const dispatch = useDispatch();
  const { orgName } = useParams();
  const navigate = useNavigate();
  const gapiLoaded = useGapiLoaded();
  const currentUser = useSelector(selectors.getCurrentUser);
  const currentOrganization = useSelector(selectors.getCurrentOrganization);
  const { t } = useTranslation();
  const documentRouteMatch = useDocumentsRouteMatch();

  const currentOrganizationRef = useRef(currentOrganization);
  currentOrganizationRef.current = currentOrganization;

  const getCurrentOrgFromRef = () => currentOrganizationRef.current.data;

  useShowWelcomeToast();

  useEffect(() => () => dispatch(actions.closeModal()), [dispatch]);

  useEffect(() => {
    if (documentRouteMatch) {
      localStorage.removeItem(LocalStorageKey.SHOULD_STOP_UPLOAD_BUTTON_ANIMATION);
    }
  }, [documentRouteMatch]);

  useErrorSubscriber();
  useOrgInviteLinkSubscription();
  useFetchInviteLink({
    organizationData: currentOrganization.data,
    enable: documentRouteMatch,
    withCurrentInviteLink: true,
  });

  useSetAvatarOrganizationSuggestion({ currentOrganization: currentOrganization.data });

  const onConfirmLogin = async () => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
      })
    );
    kratosService.profileSettings(true, ProfileSettingSections.GOOGLE_SIGN_IN);
  };

  const onGoogleSigninUpdated = async ({ name, settings, domain, associateDomains }) => {
    const isInternalUser = userServices.isInternalOrgUser(currentUser.email, domain);
    const isUserWithAssociateDomain = userServices.isUserWithAssociateDomain(currentUser.email, associateDomains);
    const isUserLoginWithGoogle = await userServices.isUserLoginWithGoogle({ loginService: currentUser.loginService });
    const isUserLoginWithDropbox = await userServices.isUserLoginWithDropbox({
      loginService: currentUser.loginService,
    });
    if (
      settings?.googleSignIn &&
      (isInternalUser || isUserWithAssociateDomain) &&
      !isUserLoginWithGoogle &&
      !isUserLoginWithDropbox
    ) {
      organizationServices.forceMemberLoginWithGoogle({
        orgName: name,
        onConfirm: () => onConfirmLogin(),
        onCancel: () => {
          dispatch(actions.resetOrganization());
          navigate(Routers.ORGANIZATION_LIST);
        },
        t,
      });
    }
  };

  const signOut = async () => {
    try {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );
      await kratosService.signOut(() => {
        logger.logInfo({
          message: LOGGER.EVENT.SIGN_OUT,
          reason: LOGGER.Service.KRATOS_INFO,
        });
        authServices.afterSignOut({ returnTo: false }, () => kratosService.samlSsoSignIn(true, currentUser.email));
      });
    } catch (error) {
      const code = error?.response?.data?.error?.code;
      if (code === STATUS_CODE.UNAUTHORIZED) {
        window.location.reload();
        return;
      }
      logger.logError({
        reason: LOGGER.Service.KRATOS_ERROR,
        error,
      });
      dispatch(actions.closeModal());
    }
  };

  const onSamlSsoSigninUpdated = async (organization) => {
    const { name, sso, domain, associateDomains, owner } = organization;
    const isInternalUser = userServices.isInternalOrgUser(currentUser.email, domain);
    const isUserWithAssociateDomain = userServices.isUserWithAssociateDomain(currentUser.email, associateDomains);
    const isUserLoginWithSamlSso = await userServices.isUserLoginWithSamlSso({
      loginService: currentUser.loginService,
    });
    if (
      sso?.ssoOrganizationId &&
      owner._id !== currentUser._id &&
      (isInternalUser || isUserWithAssociateDomain) &&
      !isUserLoginWithSamlSso
    ) {
      organizationServices.forceMemberLoginWithSamlSso({
        orgName: name,
        onConfirm: () => signOut(),
        onCancel: () => {
          dispatch(actions.resetOrganization());
          navigate(Routers.ORGANIZATION_LIST);
        },
        t,
      });
    }
  };

  const handleConfirmTransfer = useCallback(() => {
    dispatch(actions.fetchOrganizations());
    dispatch(actions.fetchCurrentOrganization(orgName));
    navigate(`/${ORG_TEXT}/${orgName}/documents`);
    dispatch(actions.closeModal());
  }, [dispatch, navigate, orgName]);

  const onAutoApproveUpdated = (organization) => {
    dispatch(actions.updateCurrentOrganization(organization));
    const { payment } = organization;
    const isEnterprise = payment.type === Plans.ENTERPRISE;

    const enterpriseModalData = {
      confirmButtonTitle: t('common.contactSales'),
      onConfirm: () => window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))),
    };

    const orgUtilities = new OrganizationUtilities({ organization });

    const oldBusinessPaymentUrl = new PaymentUrlSerializer()
      .of(organization._id)
      .trial(false)
      .period(PERIOD.ANNUAL)
      .plan(Plans.BUSINESS)
      .returnUrlParam()
      .get();

    const modalSetting = {
      type: ModalTypes.LUMIN,
      title: t('enableRequestToJoinVisibilityAutomatically.title'),
      message: (
        <Trans
          i18nKey="enableRequestToJoinVisibilityAutomatically.message"
          values={{ orgName: organization.name, domain: orgUtilities.getDomainsWithAtSign() }}
          components={{ b: <b className="kiwi-message--primary'" /> }}
        />
      ),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      confirmButtonTitle: t('common.upgrade'),
      color: 'accent',
      onConfirm: () => navigate(oldBusinessPaymentUrl),
      onCancel: () => {},
      useReskinModal: true,
      ...(isEnterprise && enterpriseModalData),
    };
    dispatch(actions.openModal(modalSetting));
  };

  const onTransferAdminUpdated = (organization) => {
    const {
      name,
      domain,
      owner: { name: ownerName },
    } = organization;
    const organizationName = name || domain;
    const modalSetting = {
      type: '',
      title: t('transferOwnershipAccepted.title'),
      message: (
        <h3>
          <Trans
            i18nKey="transferOwnershipAccepted.message"
            components={{ b: <b className="kiwi-message--primary" /> }}
            values={{ organizationName, transferredEmail: ownerName }}
          />
        </h3>
      ),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      confirmButtonTitle: t('common.ok'),
      isFullWidthButton: false,
      useReskinModal: true,
      onConfirm: () => handleConfirmTransfer(),
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };
    dispatch(actions.openModal(modalSetting));
  };

  const onPaymentUpdated = (org) => {
    const { _id: orgId, name, settings } = org;
    const { domainVisibility } = settings;

    const newSettings = {
      ...settings,
      domainVisibility,
    };
    dispatch(actions.updateCurrentOrganization({ settings: newSettings }));
    dispatch(actions.updateOrganizationInList(orgId, { settings: newSettings }));

    const paymentUtilities = new PaymentUtilities(getCurrentOrgFromRef()?.payment);
    if (paymentUtilities.isUnifyFree()) {
      return;
    }

    const modalSetting = {
      title: t('common.permissionUpdate'),
      message: (
        <Trans
          i18nKey="orgPage.subscriptionOfCircleWasCanceled"
          values={{ orgName: name }}
          components={{ b: <span className="kiwi-message--primary" /> }}
        />
      ),
      type: null,
      isFullWidthButton: false,
      confirmButtonTitle: t('common.reload'),
      className: '',
      onConfirm: () => window.location.reload(),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalSetting));
  };

  const subcriptionUpdateOrganization = useCallback(
    ({ orgId }) =>
      organizationGraphService.updateOrganization({
        orgId,
        callback: ({ organization, type }) => {
          switch (type) {
            case ORG_SUBSCRIPTION_TYPE.TRANSFER_ADMIN: {
              onTransferAdminUpdated(organization);
              break;
            }
            case ORG_SUBSCRIPTION_TYPE.AUTO_APPROVE_UPDATE:
              onAutoApproveUpdated(organization);
              break;
            case ORG_SUBSCRIPTION_TYPE.GOOGLE_SIGN_IN_SECURITY_UPDATE:
              gapiLoaded && onGoogleSigninUpdated(organization);
              break;
            case ORG_SUBSCRIPTION_TYPE.SAML_SSO_SIGN_IN_SECURITY_UPDATE:
              onSamlSsoSigninUpdated(organization);
              break;
            case ORG_SUBSCRIPTION_TYPE.PAYMENT_UPDATE:
              onPaymentUpdated(organization);
              break;
            case ORG_SUBSCRIPTION_TYPE.SETTING_UPDATE: {
              batch(() => {
                dispatch(actions.updateCurrentOrganization(organization));
                dispatch(actions.updateOrganizationInList(getCurrentOrgFromRef()?._id, organization));
              });
              break;
            }
            default:
              break;
          }
        },
      }),
    [handleConfirmTransfer, dispatch]
  );

  useUpdateSetting({ subscription: subcriptionUpdateOrganization, onGoogleSigninUpdated, onSamlSsoSigninUpdated });

  return <OrganizationPage {...props} />;
};

export default compose(withMarketingRedirect, withOrganizationFetching)(OrganizationContainer);
