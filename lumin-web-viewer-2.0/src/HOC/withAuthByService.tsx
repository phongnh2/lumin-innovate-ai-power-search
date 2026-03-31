import { Location } from 'history';
import React, { ElementType, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, matchPath, NavigateFunction } from 'react-router';

import actions from 'actions';

import authServices from 'services/authServices';

import goToDocAfterAuthentication from 'helpers/goToDocAfterAuthentication';

import { UrlUtils } from 'utils';

import { MIGRATION_DATE } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';
import { PLAN_URL } from 'constants/plan';
import { PaymentPeriod, PaymentPlans } from 'constants/plan.enum';
import { Routers, NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';
import { TokenStatus } from 'constants/tokenContants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

type RedirectParams = {
  user: IUser;
  navigate: NavigateFunction;
  location: Location;
  isSignedUp?: boolean;
  tokenStatus?: TokenStatus;
  orgData?: IOrganization;
};

type SuccessParams = RedirectParams;

const removeLocalStorageUrlList = ['activate-free-trial', 'invite-members'];

const removeLocalStorageItem = (navigate: NavigateFunction): boolean =>
  removeLocalStorageUrlList.some((data) => {
    const item = localStorage.getItem(data);
    if (item) {
      localStorage.removeItem(data);
      navigate(`${item}`);
      return true;
    }
    return false;
  });

const handleRedirect = ({
  user,
  navigate,
  location,
  isSignedUp = true,
  tokenStatus = TokenStatus.VALID,
  orgData,
}: RedirectParams): void => {
  const urlParams = new URLSearchParams(location.search);
  const planType = urlParams.get(UrlSearchParam.PLAN)?.toLowerCase();
  const planPeriod = urlParams.get(UrlSearchParam.PLAN_PERIOD)?.toUpperCase() || '';
  const promotionCode = urlParams.get(UrlSearchParam.PROMOTION) || '';
  const isTrial = Boolean(
    matchPath({
      path: Routers.TRIAL_SIGNIN,
      end: false,
      },
      location.pathname
    )
  );

  if (removeLocalStorageItem(navigate)) {
    return;
  }
  const continueUrl = UrlUtils.decodeContinue(urlParams);
  const redirectState = UrlUtils.decodeRedirectState(urlParams) as Record<string, string[]>;
  const landingPageToken = UrlUtils.decode(urlParams, UrlSearchParam.LANDING_PAGE_TOKEN);
  const invitationToken = urlParams.get(UrlSearchParam.TOKEN);
  if (invitationToken) {
    navigate(NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION, {
      state: {
      fromNonLuminFlow: !isSignedUp && tokenStatus === TokenStatus.VALID,
      hasJoinedOrg: user.hasJoinedOrg,
      organization: orgData,
      },
      replace: true,
    });
    return;
  }

  if (continueUrl) {
    navigate(continueUrl, { replace: true });
    const navigateTo = landingPageToken ? `${continueUrl}?ltk=${landingPageToken}` : continueUrl;
    navigate(navigateTo, { state: isSignedUp && { from: Routers.SIGNIN, ...redirectState }, replace: true });
    return;
  }
  if (planType && planType !== PLAN_URL.FREE) {
    authServices.handleRedirectForPricing({
      period: planPeriod as PaymentPeriod,
      promotion: promotionCode,
      plan: planType as PaymentPlans,
      isTrial,
      navigate,
    });
    return;
  }
  const { url: newAuthenUrl } = authServices.getNewAuthenRedirectUrl(user);
  goToDocAfterAuthentication();
  navigate({
    pathname: newAuthenUrl || '/',
    },{
    state: {
      showModal: !newAuthenUrl && new Date(user.lastLogin) < new Date(MIGRATION_DATE),
    },
    replace: true,
  });
};

const withAuthByService = (Component: ElementType) => (props: Record<string, unknown>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const showFailedModal = useCallback(
    ({ title, message }: { title: string; message: string }): void => {
      const modalSettings = {
        type: ModalTypes.ERROR,
        title,
        message,
      };
      dispatch(actions.openModal(modalSettings));
    },
    [dispatch]
  );

  const handleSuccess = useCallback(
    async ({ user, isSignedUp, tokenStatus, orgData }: SuccessParams): Promise<void> => {
      await authServices.signInSuccess({ user });
      handleRedirect({ user, navigate, location, isSignedUp, tokenStatus, orgData });
    },
    [navigate, location]
  );

  return <Component handleSuccess={handleSuccess} showFailedModal={showFailedModal} {...props} />;
};

export default withAuthByService;
